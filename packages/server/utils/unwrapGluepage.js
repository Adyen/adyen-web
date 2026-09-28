/**
 * TEMPORARY - Klarna Network POC only.
 *
 * Adyen currently returns a gluepage URL in `action.url` for `klarna_network`, which the Klarna Web SDK
 * rejects (PAYMENT_REQUEST_URL_PARSE_FAILED). This follows the gluepage server-side until it reaches the
 * direct Klarna Payment Request URL. Remove once the backend returns the Klarna URL directly (e.g. subtype=sdk).
 */
const ADYEN_TEST_HOSTS = new Set(['checkoutshopper-test.adyen.com', 'checkout-test.adyen.com']);
const KLARNA_TEST_HOST = 'pay.test.klarna.com';
const KLARNA_REQUEST_PATH = /^\/[a-z]{2}\/requests\/[A-Za-z0-9_-]+\/start\/?$/;
const MAX_HOPS = 5;
const MAX_HTML_BYTES = 256 * 1024;

async function unwrapGluepage(startingUrl) {
    let current = parseUrl(startingUrl);
    assertAdyenTestUrl(current);

    for (let hops = 0; hops <= MAX_HOPS; hops++) {
        const response = await fetch(current, {
            redirect: 'manual',
            headers: { Accept: 'text/html,application/xhtml+xml' },
            signal: AbortSignal.timeout(10_000)
        });
        const navigation = await readNavigation(response);
        const next = parseUrl(navigation.target, current);

        if (isKlarnaPaymentRequestUrl(next)) return next.toString();
        if (navigation.mechanism === 'form') {
            throw new Error('Gluepage form does not point directly to a Klarna Payment Request.');
        }

        assertAdyenTestUrl(next);
        if (hops === MAX_HOPS) throw new Error('Gluepage redirect limit exceeded.');
        current = next;
    }

    throw new Error('No direct Klarna Payment Request URL found.');
}

function assertAdyenTestUrl(url) {
    if (url.protocol !== 'https:' || !ADYEN_TEST_HOSTS.has(url.hostname) || url.port || url.username || url.password) {
        throw new Error('Expected an HTTPS Adyen TEST gluepage URL.');
    }
}

function isKlarnaPaymentRequestUrl(url) {
    if (
        url.protocol === 'https:' &&
        url.hostname === KLARNA_TEST_HOST &&
        !url.port &&
        !url.username &&
        !url.password &&
        !url.hash &&
        KLARNA_REQUEST_PATH.test(url.pathname)
    ) {
        return true;
    }

    if (url.hostname.endsWith('.klarna.com')) {
        throw new Error('Klarna URL failed TEST host or Payment Request path validation.');
    }
    return false;
}

async function readNavigation(response) {
    if (response.status >= 300 && response.status < 400) {
        const target = response.headers.get('location');
        if (!target) throw new Error('Gluepage redirect has no Location header.');
        return { mechanism: 'redirect', target };
    }

    if (!response.ok || !response.headers.get('content-type')?.toLowerCase().includes('text/html')) {
        throw new Error(`Unsupported gluepage response (status ${response.status}).`);
    }

    const html = (await readLimitedHtml(response)).replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '');

    const forms = html.match(/<form\b[^>]*>/gi) ?? [];
    if (forms.length > 1) throw new Error('Multiple gluepage forms are unsupported.');
    if (forms.length === 1) {
        const action = attribute(forms[0], 'action');
        if (!action) throw new Error('Gluepage form has no action.');
        return { mechanism: 'form', target: decodeHtmlUrl(action) };
    }

    const refreshTags = (html.match(/<meta\b[^>]*>/gi) ?? []).filter(tag => attribute(tag, 'http-equiv')?.toLowerCase() === 'refresh');
    if (refreshTags.length !== 1) throw new Error('Unsupported gluepage navigation.');

    const content = attribute(refreshTags[0], 'content');
    const match = content?.match(/^\s*\d+\s*;\s*url\s*=\s*(.+?)\s*$/i);
    if (!match) throw new Error('Unsupported meta-refresh format.');

    const value = match[1];
    const isQuoted = (value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"));
    return { mechanism: 'redirect', target: decodeHtmlUrl(isQuoted ? value.slice(1, -1) : value) };
}

async function readLimitedHtml(response) {
    if (!response.body) return '';

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let bytes = 0;
    let html = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) return html + decoder.decode();
        bytes += value.byteLength;
        if (bytes > MAX_HTML_BYTES) {
            await reader.cancel();
            throw new Error('Gluepage HTML exceeds size limit.');
        }
        html += decoder.decode(value, { stream: true });
    }
}

function attribute(tag, name) {
    const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'));
    return match?.[1] ?? match?.[2];
}

function decodeHtmlUrl(value) {
    return value.replace(/&amp;/gi, '&').replace(/&#(?:0*38|x0*26);/gi, '&');
}

function parseUrl(value, base) {
    try {
        return new URL(value, base);
    } catch {
        throw new Error('Invalid gluepage navigation URL.');
    }
}

module.exports = unwrapGluepage;
