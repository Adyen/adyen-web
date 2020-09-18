import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-preact-pure';
import './testMocks/matchMedia';

configure({ adapter: new Adapter() });
