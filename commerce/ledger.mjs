import { DatabaseSync } from 'node:sqlite';
import { reject } from './contracts.mjs';

// Local prototype only. No customer names, email, raw payloads, licence keys,
// tokens or payment details are stored. SQLite makes dedup/state changes atomic.
export class MockLedger {
  constructor(path, binding) {
    this.db = new DatabaseSync(path);
    try {
    this.db.exec(`PRAGMA busy_timeout=200; PRAGMA foreign_keys=ON;
      CREATE TABLE IF NOT EXISTS metadata (name TEXT PRIMARY KEY, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS events (digest TEXT PRIMARY KEY, order_id TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS orders (order_id TEXT PRIMARY KEY, paid INTEGER NOT NULL,
        revoked INTEGER NOT NULL, updated INTEGER NOT NULL, total INTEGER NOT NULL,
        refunded INTEGER NOT NULL, currency TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS grants (nonce TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(order_id),
        expires INTEGER NOT NULL, used INTEGER NOT NULL DEFAULT 0);`);
    this.db.prepare("INSERT OR IGNORE INTO metadata VALUES ('binding', ?)").run(binding);
    if (this.db.prepare("SELECT value FROM metadata WHERE name='binding'").get().value !== binding)
      throw new Error('Mock database identity mismatch');
    } catch (error) { this.db.close(); throw error; }
  }
  transaction(action) {
    this.db.exec('BEGIN IMMEDIATE');
    try { const result = action(); this.db.exec('COMMIT'); return result; }
    catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  record(digest, event, afterInsert) {
    return this.transaction(() => {
      const inserted = this.db.prepare('INSERT OR IGNORE INTO events VALUES (?, ?)').run(digest, event.orderId);
      if (!inserted.changes) return 'duplicate';
      afterInsert?.();
      const prior = this.db.prepare('SELECT * FROM orders WHERE order_id=?').get(event.orderId);
      if (prior && (prior.currency !== event.currency || prior.total !== event.total)) reject(409);
      this.db.prepare(`INSERT INTO orders VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(order_id) DO UPDATE SET paid=MAX(paid, excluded.paid), revoked=MAX(revoked, excluded.revoked),
        updated=MAX(updated, excluded.updated), refunded=MAX(refunded, excluded.refunded)`)
        .run(event.orderId, Number(event.paid), Number(event.revoked), event.updated, event.total, event.refunded, event.currency);
      return 'applied';
    });
  }
  active(orderId) {
    return !!this.db.prepare('SELECT 1 FROM orders WHERE order_id=? AND paid=1 AND revoked=0').get(orderId);
  }
  issue(value) {
    this.transaction(() => {
      if (!this.active(value.orderId)) reject(403);
      this.db.prepare('INSERT INTO grants(nonce,order_id,expires) VALUES (?,?,?)').run(value.nonce, value.orderId, value.expiresAt);
    });
  }
  consume(value, now) {
    return this.transaction(() => {
      const result = this.db.prepare(`UPDATE grants SET used=1 WHERE nonce=? AND order_id=? AND expires=?
        AND expires>? AND used=0 AND EXISTS(SELECT 1 FROM orders WHERE order_id=? AND paid=1 AND revoked=0)`)
        .run(value.nonce, value.orderId, value.expiresAt, now, value.orderId);
      if (result.changes !== 1) reject(403);
    });
  }
  report() {
    const totals = this.db.prepare('SELECT COALESCE(SUM(paid),0) AS paid, COALESCE(SUM(revoked),0) AS revoked FROM orders').get();
    const currencies = this.db.prepare(`SELECT currency, SUM(CASE WHEN paid=1 THEN total ELSE 0 END) AS gross,
      SUM(refunded) AS refunds FROM orders GROUP BY currency ORDER BY currency`).all();
    return { environment: 'mock', providerConfirmedOrders: 0, mockPaidOrders: totals.paid, revokedOrders: totals.revoked,
      currencies: currencies.map(row => ({ ...row, providerFees: null, tax: null, netProceeds: null })),
      recurringRevenue: null, note: 'Synthetic events only; no real orders, traffic, conversion or revenue are established.' };
  }
  close() { if (this.db.isOpen) this.db.close(); }
}
