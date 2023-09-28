import { mount } from 'enzyme';
import { h } from 'preact';
import Redirect from './Redirect';
import RedirectShopper from './components/RedirectShopper';

describe('Redirect', () => {
    describe('isValid', () => {
        test('Is always valid', () => {
            const redirect = new Redirect({ type: 'redirect', core: global.core });
            expect(redirect.isValid).toBe(true);
        });
    });

    describe('Redirect Status', () => {
        test('Accepts a POST redirect status', () => {
            window.HTMLFormElement.prototype.submit = jest.fn();

            const wrapper = mount(<RedirectShopper url="http://www.adyen.com" method="POST" data={{}} />);

            expect(wrapper.find('form')).toHaveLength(1);
            expect(wrapper.find('form').prop('action')).toBe('http://www.adyen.com');
            setTimeout(() => expect(window.HTMLFormElement.prototype.submit).toHaveBeenCalled(), 0);
        });
    });
});
