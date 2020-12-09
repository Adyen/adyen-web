import { h } from 'preact';
import { shallow, mount } from 'enzyme';
import BacsInput from './BacsInput';

const defaultProps = {
    onChange: () => {},
    onSubmit: () => {},
    onEdit: () => {}
};

describe('BacsInput', () => {
    const getWrapper = (props?) => mount(<BacsInput {...defaultProps} {...props} />);

    test('Should display expected fields for opening (enter-data) state', () => {
        const wrapper = getWrapper({});

        // Main holder
        expect(wrapper.find('.adyen-checkout__bacs')).toHaveLength(1);

        // Name
        expect(wrapper.find('div.adyen-checkout__bacs--holder-name')).toHaveLength(1);

        // Holder for account & location + account & location fields
        expect(wrapper.find('.adyen-checkout__bacs .adyen-checkout__bacs__num-id')).toHaveLength(1);
        expect(wrapper.find('div.adyen-checkout__bacs--bank-account-number')).toHaveLength(1);
        expect(wrapper.find('div.adyen-checkout__bacs--bank-location-id')).toHaveLength(1);

        // Email
        expect(wrapper.find('div.adyen-checkout__bacs--shopper-email')).toHaveLength(1);

        // Consent checkboxes
        expect(wrapper.find('ConsentCheckbox')).toHaveLength(2);
    });

    test('Should display expected fields for second (confirm-data) state', () => {
        const wrapper = getWrapper({});

        wrapper.instance().setStatus('confirm-data');
        wrapper.update();

        // Main holder (with additional 'confim' class)
        expect(wrapper.find('.adyen-checkout__bacs.adyen-checkout__bacs--confirm')).toHaveLength(1);

        // Edit button
        expect(wrapper.find('.adyen-checkout__bacs .adyen-checkout__bacs--edit')).toHaveLength(1);

        // Name (inactive)
        expect(wrapper.find('div.adyen-checkout__bacs--holder-name.adyen-checkout__field--inactive')).toHaveLength(1);

        // Holder for account & location + inactive account & location fields
        expect(wrapper.find('.adyen-checkout__bacs .adyen-checkout__bacs__num-id')).toHaveLength(1);

        expect(wrapper.find('div.adyen-checkout__bacs--bank-account-number.adyen-checkout__field--inactive')).toHaveLength(1);
        // expect(wrapper.find('input.adyen-checkout__bacs-input--bank-account-number[readonly="true"]')).toHaveLength(1);

        expect(wrapper.find('div.adyen-checkout__bacs--bank-location-id.adyen-checkout__field--inactive')).toHaveLength(1);

        // Email (inactive)
        expect(wrapper.find('div.adyen-checkout__bacs--shopper-email.adyen-checkout__field--inactive')).toHaveLength(1);

        // No consent checkboxes
        expect(wrapper.find('ConsentCheckbox')).toHaveLength(0);
    });
});
