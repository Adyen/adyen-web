import { h } from 'preact';
import { mount } from 'enzyme';
import Fieldset from './Fieldset';
import CoreProvider from '../../../../core/Context/CoreProvider';

describe('Fieldset', () => {
    const i18n = { get: key => key };
    const getWrapper = props =>
        mount(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                <Fieldset i18n={i18n} {...props} />{' '}
            </CoreProvider>
        );

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
