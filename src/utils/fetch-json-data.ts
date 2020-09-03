import { FALLBACK_CONTEXT } from '../core/config';

export default ({ path, loadingContext = FALLBACK_CONTEXT, method = 'GET', contentType = 'text/plain' }, dataObj) => {
    const options = {
        method,
        mode: 'cors',
        cache: 'default',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'Content-Type': contentType
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer-when-downgrade',
        body: JSON.stringify(dataObj)
    } as RequestInit;

    const url = `${loadingContext}${path}`;

    return fetch(url, options)
        .then(response => {
            if (response.ok) return response.json();

            return console.warn(`Service at ${url} is not available`);
        })
        .then(data => data)
        .catch(e => {
            console.warn(`Call to ${url} failed. Error= ${e}`);
        });
};
