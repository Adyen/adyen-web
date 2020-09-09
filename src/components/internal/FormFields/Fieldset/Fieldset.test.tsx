import { h } from 'preact';
import { shallow } from 'enzyme';
import Fieldset from './Fieldset';

describe('Fieldset', () => {
    const i18n = { get: key => key };
    const getWrapper = props => shallow(<Fieldset i18n={i18n} {...props} />);

    test('shows a label', () => {
        const label = 'Test ABC';
        const wrapper = getWrapper({ label });
        expect(wrapper.find('.adyen-checkout__fieldset__title')).toHaveLength(1);
        expect(wrapper.find('.adyen-checkout__fieldset__title').text()).toEqual(label);
    });

    test('shows no label', () => {
        const wrapper = getWrapper({});
        expect(wrapper.find('.adyen-checkout__fieldset__title')).toHaveLength(0);
    });
});
