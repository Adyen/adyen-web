import { configure } from 'enzyme';
import '@testing-library/jest-dom';
import Adapter from 'enzyme-adapter-preact-pure';
import './testMocks/matchMedia';
import './testMocks/i18nMock';
import './testMocks/resourcesMock';
import './testMocks/core.mock';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'whatwg-fetch';

configure({ adapter: new Adapter() });
