import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import ConsentCheckboxLabel from './ConsentCheckboxLabel';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import { setupCoreMock } from '../../../../config/testMocks/setup-core-mock';

const renderConsentCheckboxLabel = (url?: string) => {
    const core = setupCoreMock();
    const { i18n, resources } = core.modules;

    render(
        <CoreProvider i18n={i18n} loadingContext="test" resources={resources}>
            <ConsentCheckboxLabel url={url} />
        </CoreProvider>
    );
};

describe('ConsentCheckboxLabel', () => {
    test('should render the payment conditions link with the given url', () => {
        renderConsentCheckboxLabel('https://example.com/conditions');

        expect(screen.getByText('payment conditions')).toHaveAttribute('href', 'https://example.com/conditions');
    });

    test('should render the payment conditions link without an href when no url is given', () => {
        renderConsentCheckboxLabel(undefined);

        expect(screen.getByText('payment conditions')).not.toHaveAttribute('href');
    });
});
