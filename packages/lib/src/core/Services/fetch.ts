import { fetch as fetchPolyfill } from 'whatwg-fetch';

const fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response> = 'fetch' in window ? window.fetch : fetchPolyfill;

export default fetch;
