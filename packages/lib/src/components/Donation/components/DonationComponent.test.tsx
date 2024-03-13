import { h } from 'preact';
import { mount } from 'enzyme';
import DonationComponent from './DonationComponent';
import { render, screen } from '@testing-library/preact';
import CoreProvider from '../../../core/Context/CoreProvider';

const onDonate = () => {};
const amounts = {
    currency: 'EUR',
    values: [50, 199, 300]
};

const createWrapper = (props = {}) => {
    return mount(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <DonationComponent onDonate={onDonate} amounts={amounts} {...props} />
        </CoreProvider>
    );
};

describe('DonationComponent', () => {
    test('Renders the Donation Component', () => {
        const wrapper = createWrapper();
        expect(wrapper.find('.adyen-checkout__adyen-giving')).toHaveLength(1);
    });

    test('Renders the Success state', () => {
        const wrapper = createWrapper({ amounts, onDonate });
        wrapper.find('DonationComponent').instance().setStatus('success');
        wrapper.update();
        expect(wrapper.find('.adyen-checkout__status__icon--success')).toBeDefined();
    });

    test('Renders the Error state', () => {
        const wrapper = createWrapper({ amounts, onDonate });
        wrapper.find('DonationComponent').instance().setStatus('error');
        wrapper.update();
        expect(wrapper.find('.adyen-checkout__status__icon--error')).toBeDefined();
    });

    test('Shows amounts', () => {
        const wrapper = createWrapper();
        expect(wrapper.find('.adyen-checkout__button-group__input')).toHaveLength(3);
    });

    test('Should return isValid true when an amount is selected', () => {
        const onChangeMock = jest.fn();
        const wrapper = createWrapper({ onChange: onChangeMock });
        wrapper.find('.adyen-checkout__button-group__input').first().simulate('change');
        const lastOnChangeCall = onChangeMock.mock.calls.pop();
        expect(lastOnChangeCall[0].isValid).toBe(true);
    });

    test('Calls the onCancel event', () => {
        const onCancelMock = jest.fn();
        const wrapper = createWrapper({ onCancel: onCancelMock });
        wrapper.find('.adyen-checkout__button--decline').simulate('click');
        expect(onCancelMock.mock.calls).toHaveLength(1);
    });

    test('Shows the Cancel button by default', () => {
        const wrapper = createWrapper();
        expect(wrapper.find('.adyen-checkout__button--decline')).toHaveLength(1);
    });

    test('Hides the Cancel button', () => {
        const wrapper = createWrapper({ amounts, showCancelButton: false });
        expect(wrapper.find('.adyen-checkout__button--decline')).toHaveLength(0);
    });

    test('Should show number fractions in the labels', () => {
        const wrapper = createWrapper();
        expect(wrapper.find('label.adyen-checkout__button').at(0).text()).toEqual('€0.50');
        expect(wrapper.find('label.adyen-checkout__button').at(1).text()).toEqual('€1.99');
        expect(wrapper.find('label.adyen-checkout__button').at(2).text()).toEqual('€3.00');
    });

    test('Should submit the right amount', () => {
        const onDonateMock = jest.fn();
        const wrapper = createWrapper({ onDonate: onDonateMock });

        wrapper.find('.adyen-checkout__button-group__input').first().simulate('change');
        wrapper.find('.adyen-checkout__button--donate').simulate('click');

        const callbackData = onDonateMock.mock.calls[0][0];
        expect(callbackData.data.amount.value).toBe(50);
    });

    test('Should render the disclaimer if termsAndConditionUrl presents', () => {
        const termsAndConditionUrl = 'https://www.adyen.com';

        render(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                <DonationComponent amounts={amounts} termsAndConditionsUrl={termsAndConditionUrl} onDonate={onDonate} />
            </CoreProvider>
        );
        expect(screen.getByText('By donating you agree to the', { exact: false }).textContent).toEqual(
            'By donating you agree to the terms and conditions'
        );
    });

    test('Should not render the disclaimer if there is no termsAndConditionUrl', () => {
        render(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                <DonationComponent amounts={amounts} onDonate={onDonate} />
            </CoreProvider>
        );
        expect(screen.queryByText('By continuing', { exact: false })).toBeNull();
    });
});
