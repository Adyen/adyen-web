import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import { mock } from 'jest-mock-extended';
import CardFields from './CardFields';
import Language from '../../../../../language';
import { CoreProvider } from '../../../../../core/Context/CoreProvider';
import { ILanguageService } from '../../../../../language/LanguageService';
import { ENCRYPTED_EXPIRY_DATE, ENCRYPTED_SECURITY_CODE } from '../../../../internal/SecuredFields/lib/constants';
import enUS from '../../../../../../../server/translations/en-US.json';

/**
 * Builds a real Language instance (rather than the shared global.i18n mock) so that tests can supply
 * their own customTranslations and exercise Language#hasCustomTranslation.
 */
const createI18n = (customTranslations: Record<string, string> = {}) => {
    const mockedService = mock<ILanguageService>({});
    const i18n = new Language({
        locale: 'en-US',
        service: mockedService,
        customTranslations: { 'en-US': customTranslations }
    });
    i18n['_translations'] = { ...enUS, ...customTranslations };
    return i18n;
};

const renderCardFields = (props = {}, i18n = createI18n()) => {
    return render(
        <CoreProvider i18n={i18n} loadingContext="test" resources={global.resources}>
            <CardFields
                brand="card"
                dualBrandingChangeHandler={() => {}}
                selectedBrandValue=""
                errors={{}}
                hasCVC={true}
                valid={{}}
                onFocusField={() => {}}
                {...props}
            />
        </CoreProvider>
    );
};

describe('CardFields', () => {
    test('should not render an error message when there is no error for the field', () => {
        renderCardFields({ errors: {} });
        expect(screen.queryByText(/enter/i)).not.toBeInTheDocument();
    });

    test('should append the contextual hint to the expiry date error message', () => {
        renderCardFields({ errors: { [ENCRYPTED_EXPIRY_DATE]: 'cc.dat.912' } });

        expect(screen.getByText('Enter a valid expiry date. Front of card in MM/YY format.')).toBeInTheDocument();
    });

    test('should not append a contextual hint for fields that are not configured with one (e.g. CVC)', () => {
        renderCardFields({ errors: { [ENCRYPTED_SECURITY_CODE]: 'cc.cvc.920' } });

        // Exact match confirms no hint text got concatenated onto the error message
        expect(screen.getByText('Enter the security code')).toBeInTheDocument();
    });

    test('should skip the contextual hint when the merchant has provided a custom translation for the error itself', () => {
        const i18n = createI18n({ 'cc.dat.912': 'Data de validade inválida (MM/AA)' });

        renderCardFields({ errors: { [ENCRYPTED_EXPIRY_DATE]: 'cc.dat.912' } }, i18n);

        // Exact match confirms the merchant's own translation is used verbatim, without our hint appended
        expect(screen.getByText('Data de validade inválida (MM/AA)')).toBeInTheDocument();
    });
});
