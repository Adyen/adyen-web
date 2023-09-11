import { mount } from 'enzyme';
import { h } from 'preact';
import Redirect from './Redirect';
import RedirectShopper from './components/RedirectShopper';

jest.mock('../../utils/detectInIframe', () => {
    return jest.fn().mockImplementation(() => {
        return true;
    });
});

describe('Redirect', () => {
    describe('isValid', () => {
        test('Is always valid', () => {
            const redirect = new Redirect({});
            expect(redirect.isValid).toBe(true);
        });
    });

    describe('Redirect Status', () => {
        test('Accepts a POST redirect status', () => {
            window.HTMLFormElement.prototype.submit = jest.fn();

            const wrapper = mount(<RedirectShopper url="http://www.adyen.com" method="POST" data={{}} />);

            expect(wrapper.find('form')).toHaveLength(1);
            expect(wrapper.find('form').prop('action')).toBe('http://www.adyen.com');
            expect(wrapper.find('form').prop('target')).toBe(undefined);
            setTimeout(() => expect(window.HTMLFormElement.prototype.submit).toHaveBeenCalled(), 0);
        });

        test('Accepts a POST redirect status, setting target to _top, when the config prop tells it to', () => {
            window.HTMLFormElement.prototype.submit = jest.fn();

            const wrapper = mount(<RedirectShopper url="http://www.adyen.com" method="POST" data={{}} redirectFromTopWhenInIframe={true} />);

            expect(wrapper.find('form')).toHaveLength(1);
            expect(wrapper.find('form').prop('target')).toBe('_top');
            setTimeout(() => expect(window.HTMLFormElement.prototype.submit).toHaveBeenCalled(), 0);
        });
    });
});
