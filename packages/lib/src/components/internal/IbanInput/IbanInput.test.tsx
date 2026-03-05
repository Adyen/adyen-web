import { createRef, h } from 'preact';
import { render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import IbanInput from './IbanInput';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import { GenericError } from '../../../core/Errors/types';

const renderIbanInput = (props = {}) => {
    const ibanRef = createRef();
    const view = render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <IbanInput ref={ibanRef} data={{}} {...props} />
        </CoreProvider>
    );

    return { ibanRef, view };
};
describe('IbanInput', () => {
    test('should render holder name and iban number fields', async () => {
        renderIbanInput();
        expect(await screen.findByLabelText('Holder Name')).toBeInTheDocument();
        expect(await screen.findByLabelText('Account Number (IBAN)')).toBeInTheDocument();
    });

    describe('Validation Errors', () => {
        test('should show iban error on blur with invalid value and clear on valid input', async () => {
            const user = userEvent.setup();
            renderIbanInput();

            const ibanInput = await screen.findByLabelText('Account Number (IBAN)');

            await user.type(ibanInput, 'NL13TEST0123456781');
            await user.tab();

            await waitFor(() => {
                expect(ibanInput).toHaveAttribute('aria-invalid', 'true');
            });

            await user.clear(ibanInput);
            await user.tab();

            await waitFor(() => {
                expect(ibanInput).toHaveAttribute('aria-invalid', 'false');
            });
        });

        test('should show holderName error', async () => {
            const { ibanRef } = renderIbanInput();

            const ibanHolderNameErrorObj: GenericError = {
                isValid: false,
                errorMessage: 'ach.accountHolderNameField.invalid',
                error: 'ach.accountHolderNameField.invalid'
            };

            const holderInput = await screen.findByLabelText('Holder Name');

            ibanRef.current.setError('holder', ibanHolderNameErrorObj);

            await waitFor(() => {
                expect(holderInput).toHaveAttribute('aria-invalid', 'true');
            });
        });
    });

    describe('Validation Success', () => {
        test('should mark iban as valid when a correct IBAN is entered', async () => {
            const user = userEvent.setup();
            const { view } = renderIbanInput();

            const ibanInput = await screen.findByLabelText('Account Number (IBAN)');

            await user.type(ibanInput, 'NL13TEST0123456789');

            await waitFor(() => {
                // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
                expect(view.container.querySelector('.adyen-checkout__input--valid')).toBeInTheDocument();
            });
        });
    });

    describe('Placeholders', () => {
        test('should set iban placeholder', async () => {
            renderIbanInput({ placeholders: { ibanNumber: 'test' } });
            expect(await screen.findByPlaceholderText('test')).toBeInTheDocument();
        });

        test('should set holderName placeholder', async () => {
            renderIbanInput({ placeholders: { ownerName: 'test' } });
            expect(await screen.findByPlaceholderText('test')).toBeInTheDocument();
        });
    });

    describe('Send values from outside', () => {
        test('should set ibanNumber', async () => {
            renderIbanInput({ data: { ibanNumber: 'NL13TEST0123456789' } });

            const inputEl = await screen.findByLabelText('Account Number (IBAN)');

            expect(inputEl).toHaveValue('NL13 TEST 0123 4567 89');
        });

        test('should set ibanNumber formatted', async () => {
            renderIbanInput({ data: { ibanNumber: 'NL13 TEST 0123 4567 89' } });

            const inputEl = await screen.findByLabelText('Account Number (IBAN)');

            expect(inputEl).toHaveValue('NL13 TEST 0123 4567 89');
        });

        test('should set ownerName', async () => {
            renderIbanInput({ data: { ownerName: 'Hello World' } });

            const inputEl = await screen.findByLabelText('Holder Name');

            expect(inputEl).toHaveValue('Hello World');
        });
    });
});
