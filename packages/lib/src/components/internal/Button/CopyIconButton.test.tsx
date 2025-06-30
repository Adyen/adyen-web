import { h } from 'preact';
import { screen, render, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { CopyIconButton } from './CopyIconButton';
import copyToClipboard from '../../../utils/clipboard';
import { CoreProvider } from '../../../core/Context/CoreProvider';

jest.mock('../../../utils/clipboard');

const renderComponent = (text = 'Copy me') =>
    render(
        <CoreProvider i18n={global.i18n} loadingContext={'test'} resources={global.resources}>
            <CopyIconButton text={text} />
        </CoreProvider>
    );

describe('CopyIconButton', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('copies text to clipboard on click and shows "copied" tooltip', async () => {
        (copyToClipboard as jest.Mock).mockResolvedValue(undefined);
        renderComponent('copied text');

        const button = screen.getByRole('button', { name: /copy/i });
        await user.click(button);

        expect(copyToClipboard).toHaveBeenCalledWith('copied text');
        expect(await screen.findByRole('tooltip', { name: /copied!/i })).toBeInTheDocument();
    });

    test('shows "Copy" tooltip on hover and hides it on mouse leave', async () => {
        renderComponent();

        const button = screen.getByRole('button', { name: /copy/i });

        await user.hover(button);
        expect(await screen.findByRole('tooltip', { name: /copy/i })).toBeInTheDocument();

        await user.unhover(button);
        await waitFor(() => {
            expect(screen.queryByRole('tooltip', { name: /copy/i })).not.toBeInTheDocument();
        });
    });

    test('pressing Escape hides the tooltip', async () => {
        renderComponent();

        const button = screen.getByRole('button', { name: /copy/i });

        await user.tab(); // Focus the button first
        expect(button).toHaveFocus();
        expect(await screen.findByRole('tooltip', { name: /copy/i })).toBeInTheDocument();

        await user.keyboard('{Escape}');
        await waitFor(() => {
            expect(screen.queryByRole('tooltip', { name: /copy/i })).not.toBeInTheDocument();
        });
    });

    test('pressing Enter copies the text', async () => {
        (copyToClipboard as jest.Mock).mockResolvedValue(undefined);
        renderComponent('copied text');

        const button = screen.getByRole('button', { name: /copy/i });

        await user.tab();
        expect(button).toHaveFocus();
        expect(await screen.findByRole('tooltip', { name: /copy/i })).toBeInTheDocument();

        await user.keyboard('{Enter}');
        expect(copyToClipboard).toHaveBeenCalledWith('copied text');
    });
});
