import { fetch as fetchPolyfill } from 'whatwg-fetch';

const fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response> =
    typeof window !== 'undefined' && 'fetch' in window ? window.fetch : fetchPolyfill;

export default fetch;
