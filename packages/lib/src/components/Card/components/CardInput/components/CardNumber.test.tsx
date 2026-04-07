import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import CardNumber from './CardNumber';
import { CoreProvider } from '../../../../../core/Context/CoreProvider';
import { BRAND_READABLE_NAME_MAP } from '../../../../internal/SecuredFields/lib/constants';

const renderCardNumber = (props = {}) => {
    return render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <CardNumber
                label="Card number"
                error=""
                isValid={false}
                focused={true}
                filled={false}
                showBrandIcon={true}
                brand="card"
                onFocusField={() => {}}
                {...props}
            />
        </CoreProvider>
    );
};

const selectableDualBrandingElements = [
    { id: 'visa', brandObject: { brand: 'visa', localeBrand: 'VISA', cvcPolicy: 'required', expiryDatePolicy: 'required', panLength: 16 } },
    {
        id: 'cartebancaire',
        brandObject: { brand: 'cartebancaire', localeBrand: 'Carte Bancaire', cvcPolicy: 'required', expiryDatePolicy: 'required', panLength: 16 }
    }
];

const displayOnlyDualBrandingElements = [
    { id: 'visa', brandObject: { brand: 'visa', localeBrand: 'VISA', cvcPolicy: 'required', expiryDatePolicy: 'required', panLength: 16 } },
    { id: 'mc', brandObject: { brand: 'mc', localeBrand: 'MasterCard', cvcPolicy: 'required', expiryDatePolicy: 'required', panLength: 16 } }
];

describe('CardNumber and the (dual)branding icons that show in the PAN field', () => {
    test('should render with standard brand image and no dual branding', () => {
        renderCardNumber();
        expect(screen.getByTestId('encryptedCardNumber')).toBeInTheDocument();
        expect(screen.getByAltText('card')).toBeInTheDocument();
        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(1);
    });

    test('should render with inline dual branding icons for display-only brands', () => {
        renderCardNumber({ dualBrandingElements: displayOnlyDualBrandingElements });
        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(2);
        expect(screen.getByAltText(BRAND_READABLE_NAME_MAP.visa)).toBeInTheDocument();
        expect(screen.getByAltText(BRAND_READABLE_NAME_MAP.mc)).toBeInTheDocument();
    });

    test('should hide inline dual branding icons when the field is in error', () => {
        renderCardNumber({ error: 'error message', dualBrandingElements: selectableDualBrandingElements });
        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(1);
        expect(screen.getByAltText('Error')).toBeInTheDocument();
        expect(screen.getByText('error message')).toBeInTheDocument();
    });

    test('should render dual brand selector with buttons when brands require selection mechanism', () => {
        renderCardNumber({ dualBrandingElements: selectableDualBrandingElements, dualBrandingChangeHandler: jest.fn(), brandsConfiguration: {} });
        const buttons = screen.getAllByRole('button');
        expect(buttons).toHaveLength(2);
        expect(screen.getByRole('button', { name: /visa/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cartebancaire/i })).toBeInTheDocument();
    });

    test('should render display-only brand images without buttons for non-selectable dual brands', () => {
        renderCardNumber({ dualBrandingElements: displayOnlyDualBrandingElements });
        expect(screen.queryAllByRole('button')).toHaveLength(0);
        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(2);
    });

    test('should show contextual text when dual brand selector is active', () => {
        renderCardNumber({ dualBrandingElements: selectableDualBrandingElements, dualBrandingChangeHandler: jest.fn(), brandsConfiguration: {} });
        expect(screen.getAllByText(/select the card brand/i)[0]).toBeVisible();
    });
});
