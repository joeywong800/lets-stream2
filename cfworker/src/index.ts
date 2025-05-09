/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
  async fetch(request: Request, env: unknown, ctx: unknown): Promise<Response> {
    const url = new URL(request.url);
    // Log all incoming requests for debugging
    console.log(`[WORKER] Incoming request: ${request.method} ${url.pathname}${url.search}`);

    // Fallback: If a direct asset request comes in, rewrite it to the proxy
    if (url.pathname.startsWith('/_next/static/')) {
      // You may want to restrict this to only known origins for security
      const origin = 'https://vidlink.pro'; // or dynamically determine if needed
      const assetUrl = origin + url.pathname;
      console.warn(`[WORKER] Fallback: rewriting direct asset request ${url.pathname} to ${assetUrl}`);
      try {
        return await proxyFetch(assetUrl, request, {}, false);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return new Response(`Proxy asset error: ${message}`, {
          status: 502,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'text/plain',
          },
        });
      }
    }

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Hello World endpoint for test compatibility
    if (url.pathname === '/message') {
      return new Response('Hello, World!', { status: 200, headers: { 'Content-Type': 'text/plain' } });
    }

    // Random UUID endpoint for test compatibility
    if (url.pathname === '/random') {
      // Generate a v4 UUID
  const uuid = crypto.randomUUID
    ? crypto.randomUUID()
    : ([1e7] as unknown as number).toString().replace(/[018]/g, (c: string) => (
      (parseInt(c, 10) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> (parseInt(c, 10) / 4))).toString(16)
    ));
      return new Response(uuid, { status: 200, headers: { 'Content-Type': 'text/plain' } });
    }

    // Proxy endpoint for main HTML
    if (url.pathname === '/worker-proxy') {
      console.log(`[WORKER] Handling /worker-proxy for: ${url.searchParams.get('url')}`);
      const targetUrl = url.searchParams.get('url');
      const headersParam = url.searchParams.get('headers');
      if (!targetUrl) {
        return new Response('Missing url parameter', { status: 400 });
      }

      let customHeaders: Record<string, string> = {};
      if (headersParam) {
        try {
          customHeaders = JSON.parse(headersParam);
        } catch (e) {
          return new Response('Invalid headers param', { status: 400 });
        }
      }

      // Main HTML or direct proxy
      try {
        const resp = await proxyFetch(targetUrl, request, customHeaders, true);
        return resp;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return new Response(`Proxy error: ${message}`, {
          status: 502,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'text/plain',
          },
        });
      }
    }

    // Proxy for subresources (e.g. /worker-proxy/_next/static/...)
    if (url.pathname.startsWith('/worker-proxy/')) {
      console.log(`[WORKER] Handling asset proxy for: ${url.pathname} (origin: ${url.searchParams.get('origin')})`);
      // You must pass the original target as a query param: ?origin=https://vidlink.pro
      const origin = url.searchParams.get('origin');
      if (!origin) {
        return new Response('Missing origin parameter for asset', { status: 400 });
      }
      const assetPath = url.pathname.replace('/worker-proxy/', '');
      const assetUrl = origin + '/' + assetPath;
      try {
        return await proxyFetch(assetUrl, request, {}, false);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return new Response(`Proxy asset error: ${message}`, {
          status: 502,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'text/plain',
          },
        });
      }
    }

    // Default: Not Found
    console.warn(`[WORKER] Not rewritten or not handled: ${url.pathname}${url.search}`);
    return new Response('Not Found', { status: 404 });
  },
}

// Helper to proxy fetch and set CORS, strip headers, and rewrite asset URLs in HTML
async function proxyFetch(targetUrl: string, request: Request, customHeaders: Record<string, string> = {}, rewriteAssets = false): Promise<Response> {
  console.log(`[WORKER] Proxying request to: ${targetUrl}`);
  
  // Build headers for upstream request
  const upstreamHeaders = new Headers();
  const requestHeaders = request.headers;
  const forwardHeaders = ['accept', 'accept-encoding', 'accept-language', 'range'];
  for (const header of forwardHeaders) {
    const value = requestHeaders.get(header);
    if (value) {
      upstreamHeaders.set(header, value);
    }
  }
  for (const [key, value] of Object.entries(customHeaders)) {
    upstreamHeaders.set(key, value);
  }
  upstreamHeaders.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  upstreamHeaders.set('Accept', '*/*');

  try {
    // Make the upstream request
    const upstreamResp = await fetch(targetUrl, {
      method: request.method,
      headers: upstreamHeaders,
      redirect: 'follow',
    });

    // Get content type and log response details
    const contentType = upstreamResp.headers.get('content-type') || '';
    console.log(`[WORKER] Response from ${targetUrl}: ${upstreamResp.status} ${contentType}`);

    // Validate content types for static assets to prevent security issues
    if (targetUrl.includes('/_next/static/')) {
      const validAssetTypes = [
        'text/javascript',
        'application/javascript',
        'text/css',
        'image/',
        'font/',
        'application/json',
      ];
      
      if (!validAssetTypes.some(type => contentType.toLowerCase().includes(type))) {
        console.error(`[WORKER] Invalid content-type ${contentType} for static asset ${targetUrl}`);
        return new Response(`Invalid content-type for static asset`, {
          status: 415,
          headers: {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    // Copy headers and set CORS
    const respHeaders = new Headers(upstreamResp.headers);
    respHeaders.set('Access-Control-Allow-Origin', '*');
    respHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS');
    respHeaders.set('Access-Control-Allow-Headers', '*');

    // Remove problematic headers
    const removeHeaders = ['content-security-policy', 'x-frame-options', 'frame-options'];
    removeHeaders.forEach(header => respHeaders.delete(header));

    // For asset requests, ensure we only return valid asset content-types
    if (!rewriteAssets) {
      if (!upstreamResp.ok) {
        console.warn(`[WORKER] Asset fetch failed: ${targetUrl} - Status: ${upstreamResp.status}`);
        return new Response('Not Found', { 
          status: 404,
          headers: {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
      const ct = respHeaders.get('content-type') || '';
      if (!ct.toLowerCase().match(/(javascript|css|font|image|octet-stream|svg|woff|woff2|json|m3u8|mp4|webm|wasm|jpg|jpeg|png|gif|bmp|tiff|webp|xyz|ico)/)) {
        console.warn(`[WORKER] Invalid content-type for asset: ${ct}`);
        return new Response('Not Found', {
          status: 404,
          headers: {	
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // For non-HTML assets, return the response as-is with CORS headers
      return new Response(upstreamResp.body, {
        status: upstreamResp.status,
        headers: respHeaders,
      });
    }

    // If HTML, rewrite asset URLs to go through the proxy
    if (contentType.toLowerCase().includes('text/html')) {
      let text;
      try {
        // Try to get the charset from content-type header
        const charset = contentType.match(/charset=([^;]+)/i)?.[1] || 'utf-8';
        // Use TextDecoder for proper character encoding
        const buffer = await upstreamResp.arrayBuffer();
        const decoder = new TextDecoder(charset);
        text = decoder.decode(buffer);
      } catch (err) {
        console.error(`[WORKER] Failed to decode HTML content: ${err}`);
        // Fallback to simple text() method
        text = await upstreamResp.text();
      }

      const origin = new URL(targetUrl).origin;
      let rewritten = false;

      try {
        // 1. Rewrite root-relative asset/API URLs (/_next/static/..., /api/..., /favicon.ico, etc.)
        text = text.replace(
          /(["'=]\s*)(\/(?:_next|static|assets|media|fonts|api)\b[^\s"'<>]*)/g,
          (match, p1, p2) => {
            rewritten = true;
            return `${p1}/worker-proxy${p2}?origin=${origin}`;
          }
        );

        // 2. Rewrite common root files
        text = text.replace(
          /(["'=]\s*)(\/(?:favicon\.ico|manifest\.json|robots\.txt|sitemap\.xml)\b[^\s"'<>]*)/g,
          (match, p1, p2) => {
            rewritten = true;
            return `${p1}/worker-proxy${p2}?origin=${origin}`;
          }
        );

        // 3. Rewrite absolute asset/API URLs
        text = text.replace(
          new RegExp(origin.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&") + "(\\/(?:_next|static|assets|media|fonts|api)\\b[^\\s\"'<>]*)", "g"),
          (match, p1) => {
            rewritten = true;
            return `/worker-proxy${p1}?origin=${origin}`;
          }
        );

        // 4. Rewrite protocol-relative asset/API URLs
        const protoRel = origin.replace(/^https?:\/\//, '').replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
        text = text.replace(
          new RegExp("//" + protoRel + "(\\/(?:_next|static|assets|media|fonts|api)\\b[^\\s\"'<>]*)", "g"),
          (match, p1) => {
            rewritten = true;
            return `/worker-proxy${p1}?origin=${origin}`;
          }
        );

        // 5. Rewrite <base href="...">
        text = text.replace(/<base\s+href=['"]([^'"]+)['"]/gi, (match, p1) => {
          rewritten = true;
          return `<base href="/worker-proxy?url=${p1}">`;
        });

        if (!rewritten) {
          console.warn('[WORKER] No asset URLs were rewritten in HTML response!');
        }

        // Set content-type with proper charset
        respHeaders.set('Content-Type', 'text/html; charset=utf-8');

        return new Response(text, {
          status: upstreamResp.status,
          headers: respHeaders,
        });
      } catch (err) {
        console.error(`[WORKER] Failed to rewrite HTML content: ${err}`);
        // If rewriting fails, return the original HTML with CORS headers
        return new Response(text, {
          status: upstreamResp.status,
          headers: respHeaders,
        });
      }
    }

    // For non-HTML, non-asset responses, return as-is with CORS headers
    return new Response(upstreamResp.body, {
      status: upstreamResp.status,
      headers: respHeaders,
    });

  } catch (err) {
    // Handle any network or other errors
    console.error(`[WORKER] Proxy fetch error: ${err}`);
    return new Response(`Proxy error: ${err}`, {
      status: 502,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
