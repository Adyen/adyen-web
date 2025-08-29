import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import UPIMandate from './UPIMandate';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import { UPIMandateProps } from './UPIMandate';
import SRPanelProvider from '../../../../core/Errors/SRPanelProvider';
import { SRPanel } from '../../../../core/Errors/SRPanel';

const customRender = (ui: h.JSX.Element) => {
    return render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <SRPanelProvider srPanel={new SRPanel(global.core)}>{ui}</SRPanelProvider>
        </CoreProvider>
    );
};

describe('UPIMandate', () => {
    test('should render the correct text for a mandate with the "exact" rule"', () => {
        const props: UPIMandateProps = {
            amount: { value: 10000, currency: 'INR' },
            mandate: { amount: '10000', frequency: 'monthly', amountRule: 'exact' }
        };
        customRender(<UPIMandate {...props} />);
        expect(screen.getByText('You’re setting up a UPI Autopay recurring payment (₹100.00/month).')).toBeInTheDocument();
    });

    test('should render the correct text for a mandate with the "max" rule and a transaction amount', () => {
        const props: UPIMandateProps = {
            amount: { value: 10000, currency: 'INR' },
            mandate: { amount: '20000', frequency: 'monthly', amountRule: 'max' }
        };
        customRender(<UPIMandate {...props} />);
        expect(
            screen.getByText(
                'You’re setting up a UPI Autopay recurring payment (₹100.00). You’ll approve a higher limit to allow future plan changes (up to ₹200.00/month).'
            )
        ).toBeInTheDocument();
    });

    test('should render the correct text for a mandate with the "max" rule, without a transaction amount', () => {
        const props: UPIMandateProps = {
            // @ts-ignore not provide the value for the testing purpose
            amount: { currency: 'INR' },
            mandate: { amount: '20000', frequency: 'monthly', amountRule: 'max' }
        };
        customRender(<UPIMandate {...props} />);
        expect(screen.getByText('You’re setting up a UPI Autopay recurring payment (up to ₹200.00/month).')).toBeInTheDocument();
    });

    test('should render the correct text for an "adhoc" frequency mandate', () => {
        const props: UPIMandateProps = {
            amount: { value: 10000, currency: 'INR' },
            mandate: { amount: '10000', frequency: 'adhoc', amountRule: 'exact' }
        };
        customRender(<UPIMandate {...props} />);
        expect(screen.getByText('You’re setting up a UPI Autopay recurring payment (₹100.00 as presented).')).toBeInTheDocument();
    });

    test('should render nothing if currency is not provided and log a warning', () => {
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        const props: UPIMandateProps = {
            // @ts-ignore not provide the currency for the testing purpose
            amount: { value: 10000 },
            mandate: { amount: '10000', frequency: 'monthly', amountRule: 'exact' }
        };
        customRender(<UPIMandate {...props} />);
        expect(screen.queryByText('You’re setting up a UPI Autopay recurring payment', { exact: false })).not.toBeInTheDocument();
        expect(consoleWarnSpy).toHaveBeenCalledWith('No mandate information because of missing currency');
        consoleWarnSpy.mockRestore();
    });
});
