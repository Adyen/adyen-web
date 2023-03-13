const { host, protocol } = window.location;

export const httpPost = (endpoint, data) =>
    fetch(`${protocol}//${host}/${endpoint}`, {
        method: 'POST',
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(response => response.json());

export const getSearchParameters = (search = window.location.search) =>
    search
        .replace(/\?/g, '')
        .split('&')
        .reduce((acc, cur) => {
            const [key, prop = ''] = cur.split('=');
            acc[key] = decodeURIComponent(prop);
            return acc;
        }, {});
