import { h } from 'preact';
import { render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { CopyButton, CopyButtonProps } from './CopyButton';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import copyToClipboard from '../../../utils/clipboard';

jest.mock('../../../utils/clipboard');

const renderCopyButton = (props: CopyButtonProps) => {
    return render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <CopyButton {...props} />
        </CoreProvider>
    );
};

describe('CopyButton', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Renders the button with the default label', () => {
        renderCopyButton({ text: 'test' });
        expect(screen.getByRole('button', { name: /Copy/i })).toBeInTheDocument();
    });

    test('Renders the button with a custom label', () => {
        renderCopyButton({ text: 'test', label: 'Copy this' });
        expect(screen.getByRole('button', { name: /Copy this/i })).toBeInTheDocument();
    });

    test('Calls copyToClipboard with the correct text on click', async () => {
        renderCopyButton({ text: 'text-to-copy' });
        const button = screen.getByRole('button', { name: /Copy/i });
        await user.click(button);
        expect(copyToClipboard).toHaveBeenCalledWith('text-to-copy');
    });

    test('Calls the onClick prop when clicked', async () => {
        const onClick = jest.fn();
        renderCopyButton({ text: 'test', onClick });
        const button = screen.getByRole('button', { name: /Copy/i });
        await user.click(button);
        expect(onClick).toHaveBeenCalled();
    });

    test('Shows the copied label after click, then reverts', async () => {
        renderCopyButton({ text: 'test' });
        const button = screen.getByRole('button', { name: /Copy/i });
        await user.click(button);

        expect(screen.getByRole('button', { name: /Copied!/i })).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Copy/i })).toBeInTheDocument();
        });
    });

    test('Shows a custom copied label after click, then reverts', async () => {
        renderCopyButton({ text: 'test', copiedLabel: 'Done!', label: 'Copy me' });
        const button = screen.getByRole('button', { name: /Copy me/i });
        await user.click(button);

        expect(screen.getByRole('button', { name: /Done!/i })).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Copy me/i })).toBeInTheDocument();
        });
    });

    test('stops keydown event propagation for Enter key', async () => {
        const parentKeyDownSpy = jest.fn();
        render(
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions
            <div onKeyDown={parentKeyDownSpy}>
                <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                    <CopyButton text="test" />
                </CoreProvider>
            </div>
        );

        const button = screen.getByRole('button', { name: /copy/i });
        await user.tab();
        expect(button).toHaveFocus();

        await user.keyboard('{Enter}');
        expect(parentKeyDownSpy).not.toHaveBeenCalled();
    });

    test('stops keydown event propagation for Space key', async () => {
        const parentKeyDownSpy = jest.fn();
        render(
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions
            <div onKeyDown={parentKeyDownSpy}>
                <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                    <CopyButton text="test" />
                </CoreProvider>
            </div>
        );

        const button = screen.getByRole('button', { name: /copy/i });
        await user.tab();
        expect(button).toHaveFocus();

        await user.keyboard(' ');
        expect(parentKeyDownSpy).not.toHaveBeenCalled();
    });
});
