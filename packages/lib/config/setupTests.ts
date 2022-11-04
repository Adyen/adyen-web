import { configure } from 'enzyme';
import '@testing-library/jest-dom';
import Adapter from 'enzyme-adapter-preact-pure';
import './testMocks/matchMedia';

configure({ adapter: new Adapter() });
