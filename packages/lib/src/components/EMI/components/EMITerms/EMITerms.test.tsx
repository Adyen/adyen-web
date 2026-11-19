import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import { EMITerms } from './EMITerms';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import { setupCoreMock } from '../../../../../config/testMocks/setup-core-mock';

const core = setupCoreMock();
const i18n = core.modules.i18n;

const TERMS_URL = 'https://www.hdfc.bank.in/easyemi/credit-card';

const renderTerms = (props: { termsAndConditionsUrl?: string; processingMessage?: string }) =>
    render(
        <CoreProvider i18n={i18n} loadingContext={'test'} resources={core.modules.resources}>
            <EMITerms {...props} />
        </CoreProvider>
    );

describe('EMITerms', () => {
    test('should render the processing message exactly as the response worded it', () => {
        const { container } = renderTerms({ processingMessage: '299 + GST is Applicable' });

        expect(container).toHaveTextContent('299 + GST is Applicable. By continuing you agree to the terms and conditions');
        expect(container).not.toHaveTextContent('₹299.00');
    });

    test('should render the terms without a processing message when the plan carries none', () => {
        const { container } = renderTerms({});

        expect(container).toHaveTextContent(/^By continuing you agree to the terms and conditions$/);
    });

    test('should link the terms to an https terms and conditions URL', () => {
        renderTerms({ termsAndConditionsUrl: TERMS_URL });

        expect(screen.getByRole('link', { name: 'terms and conditions' })).toHaveAttribute('href', TERMS_URL);
    });

    test.each([
        ['absent', undefined],
        ['an http URL', 'http://www.hdfc.bank.in/easyemi/credit-card'],
        ['a javascript URL', 'javascript:alert(1)'],
        ['not a URL', 'terms and conditions']
    ])('should render the terms unlinked when the terms and conditions URL is %s', (_case, termsAndConditionsUrl) => {
        renderTerms({ termsAndConditionsUrl });

        expect(screen.queryByRole('link')).toBeNull();
        expect(screen.getByText(/terms and conditions/)).toBeInTheDocument();
    });
});
