import { h } from 'preact';
import { render, screen } from '@testing-library/preact';

import { ResultPanel } from './ResultPanel';

describe('ResultPanel', () => {
    test('should render its result content and caller-provided actions', () => {
        render(
            <ResultPanel
                icon="bank.svg"
                iconAlt="Bank"
                title="Success!"
                description="Your account is authorised"
                details={<span>Payment details</span>}
                actions={<button type="button">Download agreement</button>}
            />
        );

        const icon = screen.getByRole('img', { name: 'Bank' });
        const description = screen.getByText('Your account is authorised');
        expect(icon).toHaveAttribute('src', 'bank.svg');
        expect(screen.getByRole('heading', { name: 'Success!' })).toBeInTheDocument();
        expect(description).toBeInTheDocument();
        expect(screen.getByText('Payment details')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Download agreement' })).toBeInTheDocument();
    });

    test('should preserve caller-provided classes', () => {
        render(
            <ResultPanel
                classNames={{ root: 'legacy-result', icon: 'legacy-icon', description: 'legacy-description' }}
                description="Payment successful"
                icon="success.svg"
                iconAlt="Payment successful"
            />
        );

        expect(screen.getByRole('img', { name: 'Payment successful' })).toHaveClass('legacy-icon');
        expect(screen.getByText('Payment successful')).toHaveClass('legacy-description');
    });
});
