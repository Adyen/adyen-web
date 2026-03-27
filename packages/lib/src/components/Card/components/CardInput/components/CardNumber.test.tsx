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

const dualBrandingElements = [{ id: 'visa' }, { id: 'cartebancaire' }];

describe('CardNumber and the (dual)branding icons that show in the PAN field', () => {
    test('should render with standard brand image and no dual branding', () => {
        renderCardNumber();
        expect(screen.getByTestId('encryptedCardNumber')).toBeInTheDocument();
        expect(screen.getByAltText('card')).toBeInTheDocument();
        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(1);
    });

    test('should render with inline dual branding icons', () => {
        renderCardNumber({ dualBrandingElements });
        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(2);
        expect(screen.getByAltText(BRAND_READABLE_NAME_MAP.visa)).toBeInTheDocument();
        expect(screen.getByAltText('cartebancaire')).toBeInTheDocument();
    });

    test('should hide inline dual branding icons when the field is in error', () => {
        renderCardNumber({ error: 'error message', dualBrandingElements });
        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(1);
        expect(screen.getByAltText('Error')).toBeInTheDocument();
        expect(screen.getByText('error message')).toBeInTheDocument();
    });

    test('should wrap brand images in interactive radio elements when isDualBrandSelectable is true', () => {
        renderCardNumber({ dualBrandingElements, isDualBrandSelectable: true, selectedBrandValue: 'visa' });
        expect(screen.getByRole('radiogroup')).toBeInTheDocument();
        const radios = screen.getAllByRole('radio');
        expect(radios).toHaveLength(2);
        expect(screen.getByRole('radio', { name: /visa/i })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: /cartebancaire/i })).toBeInTheDocument();
    });

    test('should render display-only brand images without radio role when isDualBrandSelectable is false', () => {
        renderCardNumber({ dualBrandingElements, isDualBrandSelectable: false });
        expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
        expect(screen.queryAllByRole('radio')).toHaveLength(0);
        // Images are still visible
        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(2);
    });

    test('should show contextual text when dual branding is selectable', () => {
        renderCardNumber({
            dualBrandingElements,
            isDualBrandSelectable: true,
            selectedBrandValue: 'visa',
            showContextualElement: true,
            contextualText: 'You can select the card brand you prefer to pay with. This is optional.'
        });
        expect(screen.getByText(/you can select the card brand/i)).toBeVisible();
    });
});
