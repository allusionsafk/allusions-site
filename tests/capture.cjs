const fs = require('node:fs');
const path = require('node:path');

const playwrightPath = process.argv[2];
if (!playwrightPath) throw new Error('Pass the installed Playwright module path as the first argument.');
const { chromium } = require(playwrightPath);

const siteUrl = process.env.ALLUSIONS_PREVIEW_URL || 'http://127.0.0.1:4173/';
const siteRoot = path.resolve(__dirname, '..');
const reviewDir = path.join(siteRoot, '.impeccable', 'review');
const viewports = [390, 768, 1440];

fs.mkdirSync(reviewDir, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const reports = [];

  for (const width of viewports) {
    const context = await browser.newContext({
      viewport: { width, height: width === 390 ? 844 : width === 768 ? 1024 : 1000 },
      colorScheme: 'light',
      reducedMotion: 'reduce',
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const consoleMessages = [];
    const pageErrors = [];
    const failedRequests = [];

    page.on('console', (message) => {
      if (['warning', 'error'].includes(message.type())) {
        consoleMessages.push({ type: message.type(), text: message.text() });
      }
    });
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('requestfailed', (request) => {
      failedRequests.push({ url: request.url(), reason: request.failure()?.errorText || 'unknown' });
    });

    await page.goto(siteUrl, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    const diagnostics = await page.evaluate(() => {
      const hero = document.querySelector('h1');
      const wordmark = document.querySelector('.wordmark');
      const standard = document.querySelector('.standard');
      const nav = document.querySelector('nav');
      const firstNavLink = nav.querySelector('a');
      firstNavLink.focus();
      const focus = getComputedStyle(firstNavLink);
      const standardStyle = getComputedStyle(standard);
      const heroRect = hero.getBoundingClientRect();
      const wordmarkRect = wordmark.getBoundingClientRect();

      return {
        title: document.title,
        viewportWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        h1Count: document.querySelectorAll('h1').length,
        hero: {
          text: hero.textContent.trim(),
          left: Math.round(heroRect.left),
          right: Math.round(heroRect.right),
          width: Math.round(heroRect.width),
          fontSize: getComputedStyle(hero).fontSize,
          lineHeight: getComputedStyle(hero).lineHeight,
        },
        wordmark: {
          left: Math.round(wordmarkRect.left),
          right: Math.round(wordmarkRect.right),
          width: Math.round(wordmarkRect.width),
          clipped: wordmark.scrollWidth > wordmark.clientWidth,
        },
        navVisible: [...nav.querySelectorAll('a')].every((link) => {
          const rect = link.getBoundingClientRect();
          return rect.width > 0 && rect.height >= 44 && rect.right <= document.documentElement.clientWidth;
        }),
        focus: {
          outlineStyle: focus.outlineStyle,
          outlineWidth: focus.outlineWidth,
          outlineColor: focus.outlineColor,
          outlineOffset: focus.outlineOffset,
        },
        standard: {
          backgroundColor: standardStyle.backgroundColor,
          color: standardStyle.color,
        },
        fonts: {
          display: document.fonts.check('16px "Bricolage Grotesque"'),
          mono: document.fonts.check('16px "IBM Plex Mono"'),
        },
      };
    });

    await page.screenshot({
      path: path.join(reviewDir, `${width}.png`),
      fullPage: true,
    });

    reports.push({ width, diagnostics, consoleMessages, pageErrors, failedRequests });
    await context.close();
  }

  await browser.close();
  fs.writeFileSync(path.join(reviewDir, 'browser-report.json'), `${JSON.stringify(reports, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(reports, null, 2)}\n`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
