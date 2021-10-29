import { BASE_URL } from '../pages';
import { ClientFunction } from 'testcafe';

export default class BasePage {
    constructor(url) {
        this.pageUrl = `${BASE_URL}/${url}`;
    }

    /**
     * Client function that accesses properties on the window object
     */
    getFromWindow = ClientFunction(path => {
        const splitPath = path.split('.');
        const reducer = (xs, x) => (xs && xs[x] !== undefined ? xs[x] : undefined);

        return splitPath.reduce(reducer, window);
    });

    /**
     * Hack to force testcafe to fire expected blur events as (securedFields) switch focus
     */
    setForceClick = ClientFunction(val => {
        window.testCafeForceClick = val;
    });
}
