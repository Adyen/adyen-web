import { mount } from 'enzyme';
import { h } from 'preact';
import CardNumber from './CardNumber';
import { CoreProvider } from '../../../../../core/Context/CoreProvider';

// https://github.com/enzymejs/enzyme/issues/1925#issuecomment-490637648
const Proxy = props => (
    <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
        <CardNumber
            label="Card number"
            error=""
            isValid={false}
            focused={true}
            filled={false}
            showBrandIcon={true}
            brand="card"
            onFocusField={() => {}}
            dualBrandingElements={null}
            dualBrandingChangeHandler={() => {}}
            dualBrandingSelected=""
            {...props}
        />
    </CoreProvider>
);

const wrapper = mount(<Proxy />);

describe('CardNumber and the (dual)branding icons that show in the PAN field', () => {
    test('Renders a CardNumber field, with standard brand image, and no dual branding', () => {
        expect(wrapper.find('[data-cse="encryptedCardNumber"]')).toHaveLength(1);
        expect(wrapper.find('.adyen-checkout__card__cardNumber__brandIcon')).toHaveLength(1);
        expect(wrapper.find('.adyen-checkout__card__dual-branding__icons')).toHaveLength(0);
    });

    test('Renders a CardNumber field with inline dual branding icons', () => {
        wrapper.setProps({ dualBrandingElements: [{ id: 'visa' }, { id: 'cartebancaire' }] });
        expect(wrapper.find('.adyen-checkout__card__dual-branding__icons')).toHaveLength(1);
    });

    test('Dual branding icons should consist of 2 images and should replace the standard brand image', () => {
        // dual branding icons
        expect(wrapper.find('.adyen-checkout__card__dual-branding__icons .adyen-checkout__card__cardNumber__brandIcon')).toHaveLength(2);
        // std brand image
        expect(wrapper.find('.adyen-checkout__card__cardNumber__input .adyen-checkout__card__cardNumber__brandIcon')).toHaveLength(0);
    });

    test('Inline dual branding icons are hidden when the field is in error', () => {
        wrapper.setProps({ error: true });
        expect(wrapper.find('.adyen-checkout__card__dual-branding__icons')).toHaveLength(0);
    });
});
