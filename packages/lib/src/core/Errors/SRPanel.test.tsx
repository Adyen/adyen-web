import { screen, waitFor, within } from '@testing-library/preact';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';
import { SRPanel } from './SRPanel';

const core = setupCoreMock();

describe('SRPanel', () => {
    describe('disabled', () => {
        test('enabled method returns false', () => {
            const srPanel = new SRPanel(core, { enabled: false });
            expect(srPanel.enabled).toBe(false);
        });

        test('does not render the SRPanel in the DOM', () => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _ = new SRPanel(core, { enabled: false });
            expect(screen.queryByTestId('ariaLiveSRPanel')).not.toBeInTheDocument();
        });

        test('render method returns null', () => {
            const srPanel = new SRPanel(core, { enabled: false });
            expect(srPanel.render()).toBe(null);
        });

        test('does not render messages in the DOM', async () => {
            const srPanel = new SRPanel(core, { enabled: false });

            srPanel.setMessages(['message1', 'message2']);

            await waitFor(() => expect(screen.queryByText('message1')).not.toBeInTheDocument());
        });
    });

    describe('enabled', () => {
        test('enabled method returns true', () => {
            const srPanel = new SRPanel(core);
            expect(srPanel.enabled).toBe(true);
        });

        test('renders the SRPanel in the DOM, adds & clears messages in the panel', async () => {
            const srPanel = new SRPanel(core);

            expect(screen.getByTestId('ariaLiveSRPanel')).toBeInTheDocument();

            const panel = screen.getByTestId('ariaLiveSRPanel');

            expect(panel).toHaveRole('log');

            // eslint-disable-next-line testing-library/no-node-access
            expect(panel.getElementsByClassName('adyen-checkout-sr-panel__msg').length).toBe(0);

            srPanel.setMessages(['message1', 'message2']);

            await waitFor(() => expect(within(panel).getByText('message1')).toBeInTheDocument());

            expect(within(panel).getByText('message2')).toBeInTheDocument();

            srPanel.setMessages(null);

            // eslint-disable-next-line testing-library/no-node-access
            await waitFor(() => expect(panel.getElementsByClassName('adyen-checkout-sr-panel__msg').length).toBe(0));
        });

        test('renders visible SRPanel', () => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _ = new SRPanel(core, { showPanel: true });

            const panel = screen.getByTestId('ariaLiveSRPanel');
            expect(panel).toHaveClass('adyen-checkout-sr-panel');
        });

        test('renders screen reader only SRPanel', () => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _ = new SRPanel(core, { showPanel: false });

            const panel = screen.getByTestId('ariaLiveSRPanel');
            expect(panel).toHaveClass('adyen-checkout-sr-panel--sr-only');
        });

        test('sets aria properties', () => {
            const srPanel = new SRPanel(core);

            srPanel.setAriaProps({
                'aria-live': 'assertive',
                'aria-atomic': 'true'
            });

            const panel = screen.getByTestId('ariaLiveSRPanel');
            expect(panel).toHaveAttribute('aria-live', 'assertive');
            expect(panel).toHaveAttribute('aria-atomic', 'true');
        });

        test('logs error if panel is not found', () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const srPanel = new SRPanel(core);

            const panel = screen.getByTestId('ariaLiveSRPanel');

            panel.remove();

            srPanel.setAriaProps({
                'aria-live': 'assertive',
                'aria-atomic': 'true'
            });

            expect(consoleErrorSpy).toHaveBeenCalledWith('SRPanel: Failed to set aria props because no panel was found');

            consoleErrorSpy.mockRestore();
        });
    });
});
