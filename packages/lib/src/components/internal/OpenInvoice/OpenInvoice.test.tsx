import { h } from 'preact';
import { render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import OpenInvoice from './OpenInvoice';
import { OpenInvoiceProps } from './types';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import SRPanelProvider from '../../../core/Errors/SRPanelProvider';
import { SRPanel } from '../../../core/Errors/SRPanel';
import getDataset from '../../../core/Services/get-dataset';

jest.mock('../../../core/Services/get-dataset');
(getDataset as jest.Mock).mockImplementation(() => Promise.resolve([{ id: 'NL', name: 'Netherlands' }]));

const renderOpenInvoice = (props: Partial<OpenInvoiceProps> = {}) => {
    const srPanel = new SRPanel(global.core);
    const defaultProps: OpenInvoiceProps = {
        onChange: jest.fn(),
        consentCheckboxLabel: '',
        payButton: jest.fn(),
        data: { personalDetails: {}, billingAddress: {}, deliveryAddress: {} },
        visibility: {
            personalDetails: 'editable',
            billingAddress: 'editable',
            deliveryAddress: 'editable'
        },
        ...props
    };

    render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <SRPanelProvider srPanel={srPanel}>
                <OpenInvoice {...defaultProps} />
            </SRPanelProvider>
        </CoreProvider>
    );

    return {
        onChangeMock: defaultProps.onChange as jest.Mock,
        user: userEvent.setup()
    };
};

describe('OpenInvoice', () => {
    test('should not display fieldsets set to hidden', () => {
        renderOpenInvoice({ visibility: { personalDetails: 'hidden' } });
        expect(screen.queryByLabelText(/first name/i)).not.toBeInTheDocument();
    });

    test('should hide the delivery address by default', () => {
        renderOpenInvoice();
        expect(screen.getByText('Billing address')).toBeInTheDocument();
        expect(screen.queryByText('Delivery Address')).not.toBeInTheDocument();
    });

    test('should show the separate delivery checkbox by default', () => {
        renderOpenInvoice();
        expect(screen.getByRole('checkbox', { name: 'Specify a separate delivery address' })).toBeInTheDocument();
    });

    test('should not show the separate delivery checkbox if the delivery address is set to hidden', () => {
        renderOpenInvoice({ visibility: { deliveryAddress: 'hidden' } });
        expect(screen.queryByRole('checkbox', { name: 'Specify a separate delivery address' })).not.toBeInTheDocument();
    });

    test('should not show the separate delivery checkbox if the billing address is set to hidden', () => {
        renderOpenInvoice({ visibility: { billingAddress: 'hidden' } });
        expect(screen.queryByRole('checkbox', { name: 'Specify a separate delivery address' })).not.toBeInTheDocument();
    });

    test('should show delivery address fieldset if checkbox is toggled', async () => {
        const { user } = renderOpenInvoice();
        const deliveryCheckbox = screen.getByRole('checkbox', { name: 'Specify a separate delivery address' });

        expect(screen.queryByText('Delivery Address')).not.toBeInTheDocument();

        await user.click(deliveryCheckbox);
        expect(await screen.findByText('Delivery Address')).toBeInTheDocument();

        await user.click(deliveryCheckbox);
        expect(screen.queryByText('Delivery Address')).not.toBeInTheDocument();
    });

    test('should render a consent checkbox if a consentCheckboxLabel is passed as a prop', () => {
        renderOpenInvoice({ consentCheckboxLabel: 'I agree to the terms' });
        expect(screen.getByRole('checkbox', { name: 'I agree to the terms' })).toBeInTheDocument();
    });

    test('should call onChange with validation status when toggling the consent checkbox', async () => {
        const { user, onChangeMock } = renderOpenInvoice({
            consentCheckboxLabel: 'I agree',
            visibility: { billingAddress: 'hidden', deliveryAddress: 'hidden' }
        });

        const consentCheckbox = screen.getByRole('checkbox', { name: 'I agree' });

        // Click to check it (making it valid)
        await user.click(consentCheckbox);
        await waitFor(() => {
            expect(onChangeMock).toHaveBeenCalledWith(expect.objectContaining({ errors: expect.objectContaining({ consentCheckbox: null }) }));
        });

        // Click to uncheck it (making it invalid)
        await user.click(consentCheckbox);
        await waitFor(() => {
            expect(onChangeMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    errors: expect.objectContaining({
                        consentCheckbox: {
                            isValid: false,
                            errorMessage: 'consent.checkbox.invalid',
                            error: 'consent.checkbox.invalid'
                        }
                    })
                })
            );
        });
    });

    test('should call the onChange on initial render with default state', async () => {
        const { onChangeMock } = renderOpenInvoice();

        await waitFor(() => {
            expect(onChangeMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.any(Object),
                    errors: expect.any(Object),
                    isValid: expect.any(Boolean)
                })
            );
        });
    });

    test('should show the form instruction', () => {
        renderOpenInvoice();
        expect(screen.getByText('All fields are required unless marked otherwise.')).toBeInTheDocument();
    });
});
