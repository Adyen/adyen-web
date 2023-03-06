import { mount } from 'enzyme';
import { h } from 'preact';
import CardNumber from './CardNumber';

const wrapper = mount(
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
    />
);

describe('CardNumber', () => {
    test('Renders a CardNumber field, with standard brand image, and no dual branding', () => {
        expect(wrapper.find('[data-cse="encryptedCardNumber"]')).toHaveLength(1);
        expect(wrapper.find('.adyen-checkout__card__cardNumber__input .adyen-checkout__card__cardNumber__brandIcon')).toHaveLength(1);
        expect(wrapper.find('.adyen-checkout__card__dual-branding__buttons')).toHaveLength(0);
    });

    test('Renders a CardNumber field with a dual branding field that is inactive', () => {
        wrapper.setProps({ dualBrandingElements: [{ id: 'visa' }, { id: 'cartebancaire' }] });
        expect(wrapper.find('.adyen-checkout__card__dual-branding__buttons')).toHaveLength(1);
        expect(wrapper.find('.adyen-checkout__card__dual-branding__buttons--active')).toHaveLength(0);
    });

    test('Dual branding field should contain 2 images and should replace the standard brand image', () => {
        // images in branding field
        expect(wrapper.find('.adyen-checkout__card__dual-branding__buttons .adyen-checkout__card__cardNumber__brandIcon')).toHaveLength(2);
        // std brand image
        expect(wrapper.find('.adyen-checkout__card__cardNumber__input .adyen-checkout__card__cardNumber__brandIcon')).toHaveLength(0);
    });

    test('Dual branding field is hidden when the field is in error', () => {
        wrapper.setProps({ error: true });
        expect(wrapper.find('.adyen-checkout__card__dual-branding__buttons')).toHaveLength(0);
    });

    test('Dual branding field is shown & active when the number is valid but none of the branding images are selected', () => {
        wrapper.setProps({ error: false });
        wrapper.setProps({ isValid: true });
        expect(wrapper.find('.adyen-checkout__card__dual-branding__buttons')).toHaveLength(1);
        expect(wrapper.find('.adyen-checkout__card__dual-branding__buttons--active')).toHaveLength(1);

        expect(wrapper.find('.adyen-checkout__card__dual-branding__buttons .adyen-checkout__card__cardNumber__brandIcon--not-selected')).toHaveLength(
            0
        );
    });

    test('Dual branding field with selection made - meaning the other field becomes "not selected"', () => {
        wrapper.setProps({ dualBrandingSelected: 'cartebancaire' });
        expect(wrapper.find('.adyen-checkout__card__dual-branding__buttons .adyen-checkout__card__cardNumber__brandIcon--not-selected')).toHaveLength(
            1
        );
    });
});
