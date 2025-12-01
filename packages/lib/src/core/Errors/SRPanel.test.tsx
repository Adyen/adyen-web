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

        test('Does not render the SRPanel in the DOM', () => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _ = new SRPanel(core, { enabled: false });
            expect(screen.queryByTestId('ariaLiveSRPanel')).not.toBeInTheDocument();
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
    });
});
