process.env.VERSION = 'X.Y.Z';
process.env.BUNDLE_TYPE = 'esm';

import '@testing-library/jest-dom/jest-globals';
import '@testing-library/jest-dom';
import './testMocks/matchMedia';
import './testMocks/i18nMock';
import './testMocks/resourcesMock';
import './testMocks/core.mock';
import './testMocks/analyticsMock';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'whatwg-fetch';
import './testMocks/srPanelMock';
import './testMocks/commonCorePropsMock';

const DEFAULT_TEST_TIMEOUT = 10_000;

jest.setTimeout(DEFAULT_TEST_TIMEOUT);

process.env.VERSION = 'X.Y.Z';
process.env.BUNDLE_TYPE = 'esm';
