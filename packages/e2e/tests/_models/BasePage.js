import path from 'path';
require('dotenv').config({ path: path.resolve('../../', '.env') });

import { BASE_URL } from '../pages';

export default class BasePage {
    constructor(url) {
        this.pageUrl = `${BASE_URL}/${url}`;
        this.binLookupUrl = `https://checkoutshopper-test.adyen.com/checkoutshopper/v2/bin/binLookup?token=${process.env.CLIENT_KEY}`;
    }
}
