import { h } from 'preact';
import { render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import DualBrandSelector from './DualBrandSelector';
import { CoreProvider } from '../../../../../core/Context/CoreProvider';
import { DualBrandSelectElement } from '../../../types';

const DEFAULT_DUAL_BRAND_ELEMENTS: DualBrandSelectElement[] = [
    {
        id: 'visa',
        brandObject: {
            brand: 'visa',
            localeBrand: 'VISA',
            cvcPolicy: 'required',
            enableLuhnCheck: true,
            supported: true,
            expiryDatePolicy: 'required',
            panLength: 16
        }
    },
    {
        id: 'cartebancaire',
        brandObject: {
            brand: 'cartebancaire',
            localeBrand: 'Carte Bancaire',
            cvcPolicy: 'required',
            enableLuhnCheck: true,
            supported: true,
            expiryDatePolicy: 'required',
            panLength: 16
        }
    }
];

const getButton1 = () => screen.getByRole('button', { name: /visa/i });
const getButton2 = () => screen.getByRole('button', { name: /cartebancaire/i });
const findButton2 = () => screen.findByRole('button', { name: /cartebancaire/i });

const renderDualBrandSelector = (props = {}) => {
    const defaultProps = {
        dualBrandingElements: DEFAULT_DUAL_BRAND_ELEMENTS,
        dualBrandingChangeHandler: jest.fn(),
        brandsConfiguration: {},
        contextualText: 'Select your card brand'
    };

    return render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <DualBrandSelector {...defaultProps} {...props} />
        </CoreProvider>
    );
};

describe('DualBrandSelector', () => {
    test('should render dual brand buttons', () => {
        renderDualBrandSelector();
        expect(getButton1()).toBeInTheDocument();
        expect(getButton2()).toBeInTheDocument();
    });

    test('should render brand images inside buttons', () => {
        renderDualBrandSelector();
        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(2);
    });

    test('should have the first brand selected by default', () => {
        renderDualBrandSelector();
        expect(getButton1()).toHaveAttribute('aria-pressed', 'true');
        expect(getButton2()).toHaveAttribute('aria-pressed', 'false');
    });

    test('should switch between brands on click', async () => {
        const user = userEvent.setup();
        renderDualBrandSelector();

        expect(getButton1()).toHaveAttribute('aria-pressed', 'true');
        expect(getButton2()).toHaveAttribute('aria-pressed', 'false');

        const button2 = await findButton2();
        await user.click(button2);

        await waitFor(() => {
            expect(getButton2()).toHaveAttribute('aria-pressed', 'true');
        });
        expect(getButton1()).toHaveAttribute('aria-pressed', 'false');
    });

    test('should call dualBrandingChangeHandler when a brand is clicked', async () => {
        const user = userEvent.setup();
        const dualBrandingChangeHandler = jest.fn();
        renderDualBrandSelector({ dualBrandingChangeHandler });

        const button2 = await findButton2();
        await user.click(button2);

        expect(dualBrandingChangeHandler).toHaveBeenCalledTimes(1);
        expect(dualBrandingChangeHandler).toHaveBeenCalledWith('cartebancaire');
    });
});
