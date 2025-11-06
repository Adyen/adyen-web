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
    test('Renders a CardNumber field, with standard brand image, and no dual branding', () => {
        renderCardNumber();
        expect(screen.getByTestId('encryptedCardNumber')).toBeInTheDocument();
        expect(screen.getByAltText('card')).toBeInTheDocument();
        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(1);
    });

    test('Renders a CardNumber field with inline dual branding icons', () => {
        renderCardNumber({ dualBrandingElements });
        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(2);
        expect(screen.getByAltText(BRAND_READABLE_NAME_MAP.visa)).toBeInTheDocument();
        expect(screen.getByAltText('cartebancaire')).toBeInTheDocument();
    });

    test('Inline dual branding icons are hidden when the field is in error', () => {
        renderCardNumber({ error: 'error message', dualBrandingElements });
        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(1);
        expect(screen.getByAltText('Error')).toBeInTheDocument();
        expect(screen.getByText('error message')).toBeInTheDocument();
    });
});
