/** @tsx h */
import { createRef, h } from 'preact';
import { render, screen, act } from '@testing-library/preact';
import BacsInput from './BacsInput';
import { BacsInputProps } from './types';
import { mock } from 'jest-mock-extended';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import { AmountProvider } from '../../../core/Context/AmountProvider';

const defaultProps = {
    onChange: () => {},
    onSubmit: () => {}
};
const bacsPropsMock = mock<BacsInputProps>();

const renderBacsInput = (props = {}) => {
    const bacsRef = createRef();
    const view = render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <AmountProvider amount={{ currency: 'EUR', value: 1234 }} providerRef={createRef()}>
                {/* @ts-ignore ref is internal from the Component */}
                <BacsInput ref={bacsRef} {...defaultProps} {...props} {...bacsPropsMock} />
            </AmountProvider>
        </CoreProvider>
    );
    return { ...view, bacsRef };
};

describe('BacsInput', () => {
    test('Should display expected fields for opening (enter-data) state', () => {
        const { container } = renderBacsInput({});

        /* eslint-disable testing-library/no-node-access, testing-library/no-container */
        // Main holder
        expect(container.querySelector('.adyen-checkout__bacs')).toBeTruthy();

        // Name (active)
        expect(container.querySelector('.adyen-checkout__bacs--holder-name')).toBeTruthy();
        expect(container.querySelector('.adyen-checkout__bacs--holder-name.adyen-checkout__field--inactive')).toBeNull();

        // Holder for account & location + account & location fields
        expect(container.querySelector('.adyen-checkout__bacs .adyen-checkout__bacs__num-id')).toBeTruthy();
        expect(container.querySelector('.adyen-checkout__bacs--bank-account-number')).toBeTruthy();
        expect(container.querySelector('.adyen-checkout__bacs--bank-location-id')).toBeTruthy();

        // Email
        expect(container.querySelector('.adyen-checkout__bacs--shopper-email')).toBeTruthy();
        /* eslint-enable testing-library/no-node-access, testing-library/no-container */

        // Consent checkboxes
        expect(screen.getAllByRole('checkbox')).toHaveLength(2);
    });

    test('Should display expected fields for second (confirm-data) state', () => {
        const { container, bacsRef } = renderBacsInput({});

        void act(() => {
            bacsRef.current.setStatus('confirm-data');
        });

        /* eslint-disable testing-library/no-node-access, testing-library/no-container */
        // Main holder (with additional 'confirm' class)
        expect(container.querySelector('.adyen-checkout__bacs.adyen-checkout__bacs--confirm')).toBeTruthy();

        // Edit button
        expect(container.querySelector('.adyen-checkout__bacs .adyen-checkout__bacs--edit')).toBeTruthy();

        // Name (inactive)
        expect(container.querySelector('.adyen-checkout__bacs--holder-name.adyen-checkout__field--inactive')).toBeTruthy();

        // Holder for account & location + inactive account & location fields
        expect(container.querySelector('.adyen-checkout__bacs .adyen-checkout__bacs__num-id')).toBeTruthy();
        expect(container.querySelector('.adyen-checkout__bacs--bank-account-number.adyen-checkout__field--inactive')).toBeTruthy();
        expect(container.querySelector('.adyen-checkout__bacs--bank-location-id.adyen-checkout__field--inactive')).toBeTruthy();

        // Email (inactive)
        expect(container.querySelector('.adyen-checkout__bacs--shopper-email.adyen-checkout__field--inactive')).toBeTruthy();
        /* eslint-enable testing-library/no-node-access, testing-library/no-container */

        // No consent checkboxes
        expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    });
});
