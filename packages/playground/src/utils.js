const { host, protocol } = window.location;

export const httpPost = (endpoint, data) =>
    fetch(`${protocol}//${host}/api/${endpoint}`, {
        method: 'POST',
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(response => response.json());

export const checkPaymentResult = resultCode => ['authorised', 'received', 'pending'].includes(resultCode?.toLowerCase());

export const getSearchParameters = (search = window.location.search) =>
    search
        .replace(/\?/g, '')
        .split('&')
        .reduce((acc, cur) => {
            const [key, prop = ''] = cur.split('=');
            acc[key] = decodeURIComponent(prop);
            return acc;
        }, {});

const setSearchParams = params => {
    window.location = window.location.origin + window.location.pathname + '?' + new URLSearchParams(params).toString();
};

const insertHeader = pages => {
    const isManualFlow = getSearchParameters(window.location.search).session === 'manual';
    const container = document.querySelector('header');
    const links = pages
        .filter(page => page.id !== 'Result')
        .map(({ name, id }, index) => {
            const url = `/${index ? id.toLowerCase() : ''}`;
            const isActivePage = window.location.pathname === url;

            return `
            <li class="playground-nav__item ${isActivePage ? 'playground-nav__item--active' : ''}">
                <a href="${url}" class="playground-nav__link">${name}</a>
            </li>
        `;
        });

    const header = `
        <button type="button" class="playground-nav-button" aria-label="Toggle nav">
            <span aria-hidden></span>
        </button>

        <h1>Adyen Web <span class="env">Dev</span></h1>

        <nav class="playground-nav">
            <ul class="playground-nav__list">${links.join('')}</ul>
        </nav>
        
        <nav class="session-switch">
            <ul class="session-switch__list">
                <li><button class="session-switch__button session-switch__button--session ${
                    !isManualFlow ? 'session-switch__button--active' : ''
                }">Session</button></li>
                <li><button class="session-switch__button session-switch__button--manual ${
                    isManualFlow ? 'session-switch__button--active' : ''
                }">Manual</button></li>
            </ul>
        </nav>
    `;

    if (container) container.innerHTML = header;
};

export const searchFunctionExample = async (value, actions) => {
    const url = `/api/mock/addressSearch?search=${encodeURIComponent(value)}`;

    const formattedData = await fetch(url)
        .then(res => res.json())
        // This set is necessary to map the response receive from the external provider to our address field
        .then(res =>
            res.map(({ id, name, city, address, houseNumber, postalCode }) => ({
                id,
                name,
                city,
                street: address,
                houseNumberOrName: houseNumber,
                postalCode,
                country: 'GB'
            }))
        )
        .catch(error => {
            console.log('ERROR:', error);
            actions.reject('Something went wrong, try adding manually.');
        });
    actions.resolve(formattedData);
};

const addEventListeners = () => {
    document.querySelector('.session-switch__button--session').addEventListener('click', () => {
        const params = getSearchParameters(window.location.search);
        delete params.session;
        setSearchParams(params);
    });

    document.querySelector('.session-switch__button--manual').addEventListener('click', () => {
        const params = getSearchParameters(window.location.search);
        params.session = 'manual';
        setSearchParams(params);
    });

    document.querySelectorAll('.playground-nav__link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const url = e.target.href + window.location.search;
            window.location.assign(url);
        });
    });

    document.querySelector('.playground-nav-button').addEventListener('click', e => {
        e.target.classList.toggle('playground-nav-button--open');
        document.body.classList.toggle('nav-open');
    });
};

if (window.htmlPages) {
    insertHeader(window.htmlPages);
    addEventListeners();
}
