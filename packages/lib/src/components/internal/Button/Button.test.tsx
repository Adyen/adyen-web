import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import Button from './Button';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import { ButtonProps } from './types';

const renderButton = (props: ButtonProps) => {
    return render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <Button {...props} />
        </CoreProvider>
    );
};

describe('Button', () => {
    test('Renders a button by default', () => {
        renderButton({ label: 'label' });
        expect(screen.getByRole('button', { name: /label/i })).toBeTruthy();
    });

    test('Renders a link if href is present', () => {
        renderButton({ label: 'label', href: 'http://adyen.com' });
        expect(screen.getByRole('link', { name: /label/i })).toBeTruthy();
    });

    test('Calls onClick', async () => {
        const user = userEvent.setup();
        const onClick = jest.fn();
        renderButton({ onClick });

        await user.click(screen.getByRole('button'));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    test('Prevents onClick if disabled', async () => {
        const user = userEvent.setup();
        const onClick = jest.fn();
        renderButton({ onClick, disabled: true });

        await user.click(screen.getByRole('button'));
        expect(onClick).not.toHaveBeenCalled();
    });

    test('Uses label when a status is not defined', () => {
        renderButton({ label: 'label', status: 'ready' });
        expect(screen.getByRole('button', { name: /label/i })).toBeTruthy();
    });

    test('Uses a custom label when a status is defined', () => {
        renderButton({ label: 'label', status: 'loading' });
        const button = screen.getByRole('button');
        /* eslint-disable testing-library/no-node-access */
        expect(button.querySelector('.adyen-checkout__spinner')).toBeTruthy();
        /* eslint-enable testing-library/no-node-access */
    });

    test('Renders primary button as default', () => {
        renderButton({});
        const button = screen.getByRole('button');
        expect(button.className).toContain('adyen-checkout__button');
        expect(button.className).not.toContain('adyen-checkout__button--primary');
    });

    test('Renders secondary button', () => {
        renderButton({ variant: 'secondary' });
        expect(screen.getByRole('button').className).toContain('adyen-checkout__button--secondary');
    });

    test('Renders action button', () => {
        renderButton({ variant: 'action' });
        expect(screen.getByRole('button').className).toContain('adyen-checkout__button--action');
    });

    test('Renders ghost button', () => {
        renderButton({ variant: 'ghost' });
        expect(screen.getByRole('button').className).toContain('adyen-checkout__button--ghost');
    });

    test('Renders aria-live status region with loading text', () => {
        renderButton({ label: 'Pay', status: 'loading' });
        const statusRegion = screen.getByRole('status');

        expect(statusRegion).toBeTruthy();
        expect(statusRegion.className).toContain('adyen-checkout__button__text--sr-only');
        expect(statusRegion.getAttribute('aria-live')).toBe('polite');
        expect(statusRegion.textContent).toContain('Loading');
    });

    test('Renders aria-live status region with redirecting text', () => {
        renderButton({ label: 'Pay', status: 'redirect' });
        const statusRegion = screen.getByRole('status');

        expect(statusRegion).toBeTruthy();
        expect(statusRegion.className).toContain('adyen-checkout__button__text--sr-only');
        expect(statusRegion.getAttribute('aria-live')).toBe('polite');
        expect(statusRegion.textContent).toContain('Redirecting');
    });

    test('Aria-live status region is empty for default status', () => {
        renderButton({ label: 'Pay', status: 'default' });
        const statusRegion = screen.getByRole('status');

        expect(statusRegion).toBeTruthy();
        expect(statusRegion.textContent).toBe('');
    });
});
