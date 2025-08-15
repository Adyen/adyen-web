import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import DonationComponent from './DonationComponent';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import type { DonationComponentProps, FixedAmountsDonation, RoundupDonation } from './types';

const onDonate = jest.fn();
const onCancel = jest.fn();
const onChange = jest.fn();

const fixedAmounts: FixedAmountsDonation = {
    type: 'fixedAmounts',
    currency: 'EUR',
    values: [50, 199, 300]
};

const roundUp: RoundupDonation = {
    type: 'roundup',
    currency: 'EUR',
    maxRoundupAmount: 99
};

const commercialTxAmount = 1000;

const renderComponent = (props: Partial<DonationComponentProps> = {}) => {
    const defaultProps: DonationComponentProps = {
        commercialTxAmount,
        onDonate,
        donation: fixedAmounts
    };

    return render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <DonationComponent {...defaultProps} {...props} />
        </CoreProvider>
    );
};

describe('DonationComponent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Calls the onCancel event when the cancel button is clicked', async () => {
        renderComponent({ onCancel });
        await userEvent.click(screen.getByRole('button', { name: /not now/i }));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    test('Shows the Cancel button by default', () => {
        renderComponent();
        expect(screen.getByRole('button', { name: /not now/i })).toBeInTheDocument();
    });

    test('Hides the Cancel button when showCancelButton is false', () => {
        renderComponent({ showCancelButton: false });
        expect(screen.queryByRole('button', { name: /not now/i })).not.toBeInTheDocument();
    });

    test('Should show number fractions in the labels', () => {
        renderComponent();
        expect(screen.getByLabelText('€0.50')).toBeInTheDocument();
        expect(screen.getByLabelText('€1.99')).toBeInTheDocument();
        expect(screen.getByLabelText('€3.00')).toBeInTheDocument();
    });

    test('Should render the disclaimer if termsAndConditionsUrl is present', () => {
        const termsAndConditionsUrl = 'https://www.adyen.com';
        renderComponent({ termsAndConditionsUrl });
        expect(screen.getByText('By donating you agree to the', { exact: false }).textContent).toEqual(
            'By donating you agree to the terms and conditions'
        );
    });

    test('Should not render the disclaimer if there is no termsAndConditionsUrl', () => {
        renderComponent();
        expect(screen.queryByText('By donating you agree to the', { exact: false })).toBeNull();
    });

    describe('Fixed amount donation', () => {
        test('Shows all fixed amount options', () => {
            renderComponent();
            expect(screen.getAllByRole('radio')).toHaveLength(3);
        });

        test('Should return isValid true when an amount is selected', async () => {
            renderComponent({ onChange });
            await userEvent.click(screen.getByLabelText('€0.50'));
            expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ isValid: true }));
        });

        test('Should submit the right amount', async () => {
            renderComponent({ onDonate });

            await userEvent.click(screen.getByLabelText('€0.50'));
            await userEvent.click(screen.getByRole('button', { name: 'Donate' }));

            expect(onDonate).toHaveBeenCalledWith(expect.objectContaining({ data: { amount: { currency: 'EUR', value: 50 } } }));
        });
    });

    describe('Roundup donation', () => {
        test('Should show the roundup amount in the donate button', () => {
            renderComponent({ donation: roundUp });
            expect(screen.getByRole('button', { name: 'Donate €0.89' })).toBeInTheDocument();
        });

        test('Should show the roundup description', () => {
            renderComponent({ donation: roundUp });
            expect(screen.getByText('€0.89 is a round up', { exact: false }).textContent).toEqual(
                '€0.89 is a round up from your original payment (€10.00)'
            );
        });
    });
});
