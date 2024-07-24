import { h } from 'preact';
import { fireEvent, render, screen } from '@testing-library/preact';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import userEvent from '@testing-library/user-event';
import PhoneInput from './PhoneInput';
import { PhoneInputProps } from './types';

const items = [{ id: '+44', name: 'United Kingdom', code: 'GB', selectedOptionName: 'United Kingdom' }];

describe('PhoneInput', () => {
    const defaultProps: PhoneInputProps = {
        items,
        data: { phonePrefix: items[0].id },
        onChange: jest.fn(),
        phoneNumberErrorKey: 'mobileNumber.invalid',
        placeholders: {}
    };

    const renderPhoneInput = (props: PhoneInputProps = defaultProps) => {
        return render(
            // @ts-ignore ignore
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                <PhoneInput {...props} />
            </CoreProvider>
        );
    };

    test('should show phone prefix and phone number', async () => {
        renderPhoneInput();
        expect(await screen.findByRole('combobox')).toBeTruthy();
        expect(await screen.findByRole('textbox')).toBeTruthy();
    });

    test('should show an error message for the invalid input', async () => {
        const user = userEvent.setup({ delay: 100 });
        renderPhoneInput();
        const phoneNumberEle = await screen.findByRole('textbox');
        await user.type(phoneNumberEle, '1');
        fireEvent.blur(phoneNumberEle);
        // @ts-ignore TODO: Fix jest types
        expect(await screen.findByText(/invalid mobile number/i)).toBeInTheDocument();
    });

    test('should show a success icon for the valid input', async () => {
        const user = userEvent.setup({ delay: 100 });
        renderPhoneInput();
        const phoneNumberEle = await screen.findByRole('textbox');
        await user.type(phoneNumberEle, '123456');
        fireEvent.blur(phoneNumberEle);
        const successIcons = await screen.findAllByRole('img');
        expect(successIcons.length).toBe(2);
    });

    test('should call onChange when the data has been changed', async () => {
        const user = userEvent.setup({ delay: 100 });
        renderPhoneInput();
        const phoneNumberEle = await screen.findByRole('textbox');
        await user.type(phoneNumberEle, '123456');
        expect(defaultProps.onChange).toHaveBeenCalledWith(
            expect.objectContaining({
                data: { phoneNumber: '123456', phonePrefix: '+44' },
                errors: expect.any(Object),
                valid: expect.any(Object),
                isValid: expect.any(Boolean)
            })
        );
    });
});
