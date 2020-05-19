export const TEST_URL = 'http://localhost:3024';

const protocol = window.location.protocol;
const host = window.location.host;

export const httpPost = (endpoint, data) =>
    fetch(`${protocol}//${host}/${endpoint}`, {
        method: 'POST',
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(response => response.json());

export const getSearchParameters = search =>
    search
        .replace(/\?/g, '')
        .split('&')
        .reduce((acc, cur) => {
            const [key, prop = ''] = cur.split('=');
            acc[key] = decodeURIComponent(prop);
            return acc;
        }, {});

const insertHeader = htmlPages => {
    const container = document.querySelector('header');
    const links = htmlPages.map(name => {
        const url = name !== htmlPages[0] ? name.toLowerCase() : '';

        return `<li><a href="/${url}">${name}</a></li>`;
    });

    const header = `
        <h1>Checkout Components <span>Dev</span></h1>

        <nav class="main-nav">
            <ul>${links.join('')}</ul>
        </nav>
    `;

    if (container) container.innerHTML = header;
};

if (window.htmlPages) {
    document.onLoad = insertHeader(window.htmlPages);
}
