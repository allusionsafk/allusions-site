// /ai/* serves the AFK AI site from its existing Worker, so AFK stays one
// deployment (including the pinned /download installer) with one public home.
// The Worker's own headers, including its CSP, pass through unchanged; Pages
// _headers never apply to Function responses.

const UPSTREAM = 'https://localai-windows-starter-site.allusionsafk.workers.dev';
const PREFIX = '/ai';

// AFK pages use root-absolute paths ("/assets/...", "/download"); keep them under /ai.
function prefixPath(value) {
  return value && value.startsWith('/') && !value.startsWith('//') ? PREFIX + value : value;
}

class PrefixAttribute {
  constructor(name) { this.name = name; }
  element(el) {
    const value = el.getAttribute(this.name);
    if (this.name === 'srcset') {
      el.setAttribute('srcset', value.split(',').map(part => {
        const [url, ...rest] = part.trim().split(/\s+/);
        return [prefixPath(url), ...rest].join(' ');
      }).join(', '));
    } else {
      el.setAttribute(this.name, prefixPath(value));
    }
  }
}

export async function onRequest({ request }) {
  const url = new URL(request.url);
  if (url.pathname === PREFIX) return Response.redirect(`${url.origin}${PREFIX}/${url.search}`, 308);

  const upstreamUrl = UPSTREAM + url.pathname.slice(PREFIX.length) + url.search;
  const upstream = await fetch(upstreamUrl, {
    method: request.method,
    headers: request.headers,
    redirect: 'manual',
  });

  const response = new Response(upstream.body, upstream);
  const location = response.headers.get('location');
  if (location) {
    const target = new URL(location, UPSTREAM);
    if (target.origin === UPSTREAM) response.headers.set('location', PREFIX + target.pathname + target.search);
  }

  if (!(response.headers.get('content-type') || '').includes('text/html')) return response;
  return new HTMLRewriter()
    .on('[href]', new PrefixAttribute('href'))
    .on('[src]', new PrefixAttribute('src'))
    .on('[srcset]', new PrefixAttribute('srcset'))
    .transform(response);
}
