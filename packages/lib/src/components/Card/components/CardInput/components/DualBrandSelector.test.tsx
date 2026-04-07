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
        contextualText: 'Select your card brand',
        selectedBrandValue: 'visa'
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

    describe('Accessibility', () => {
        test('should have role="group" with aria-label matching contextual text', () => {
            const contextualText = 'Select the card brand you prefer to pay with. This is optional.';
            renderDualBrandSelector({ contextualText });

            const group = screen.getByRole('group', { name: contextualText });
            expect(group).toBeInTheDocument();
        });

        test('should toggle brand selection with keyboard Space key', async () => {
            const user = userEvent.setup();
            renderDualBrandSelector();

            const button2 = getButton2();
            button2.focus();
            await user.keyboard(' ');

            await waitFor(() => {
                expect(getButton2()).toHaveAttribute('aria-pressed', 'true');
            });
            expect(getButton1()).toHaveAttribute('aria-pressed', 'false');
        });

        test('should toggle brand selection with keyboard Enter key', async () => {
            const user = userEvent.setup();
            renderDualBrandSelector();

            const button2 = getButton2();
            button2.focus();
            await user.keyboard('{Enter}');

            await waitFor(() => {
                expect(getButton2()).toHaveAttribute('aria-pressed', 'true');
            });
            expect(getButton1()).toHaveAttribute('aria-pressed', 'false');
        });

        test('should have both buttons in tab order', () => {
            renderDualBrandSelector();

            const button1 = getButton1();
            const button2 = getButton2();

            expect(button1).not.toHaveAttribute('tabindex', '-1');
            expect(button2).not.toHaveAttribute('tabindex', '-1');
        });

        test('should have mutually exclusive aria-pressed state', async () => {
            const user = userEvent.setup();
            renderDualBrandSelector();

            // Initially first is selected
            expect(getButton1()).toHaveAttribute('aria-pressed', 'true');
            expect(getButton2()).toHaveAttribute('aria-pressed', 'false');

            // Select second
            await user.click(getButton2());
            await waitFor(() => {
                expect(getButton2()).toHaveAttribute('aria-pressed', 'true');
            });
            expect(getButton1()).toHaveAttribute('aria-pressed', 'false');

            // Select first again
            await user.click(getButton1());
            await waitFor(() => {
                expect(getButton1()).toHaveAttribute('aria-pressed', 'true');
            });
            expect(getButton2()).toHaveAttribute('aria-pressed', 'false');
        });
    });
});
