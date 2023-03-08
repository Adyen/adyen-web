import { SRPanel } from './SRPanel';
import { screen, waitFor } from '@testing-library/preact';

describe('SRPanel disabled', () => {
    new SRPanel({ enabled: false });

    test('Does not render the SRPanel in the DOM', async () => {
        // Expect panel to not be present
        /* eslint-disable-next-line */
        expect(screen.queryByTestId('ariaLiveSRPanel')).toBeNull();
    });
});

describe('SRPanel in use', () => {
    test('Renders the SRPanel in the DOM, adds & clears messages in the panel', async () => {
        const srPanel = new SRPanel({});

        // Expect panel present - but empty
        expect(screen.getByTestId('ariaLiveSRPanel')).toBeTruthy();
        await waitFor(() => expect(screen.queryByTestId('message1')).toBeNull());

        // Set messages
        srPanel.setMessages(['message1', 'message2']);

        /* eslint-disable-next-line */
        await waitFor(() => expect(screen.getByTestId('message1')).toBeTruthy());
        /* eslint-disable-next-line */
        await waitFor(() => expect(screen.getByTestId('message2')).toBeTruthy());

        /* eslint-disable-next-line */
        await waitFor(() => expect(screen.queryByTestId('message1')).toBeTruthy()); // presence
        /* eslint-disable-next-line */
        await waitFor(() => expect(screen.queryByTestId('message3')).toBeNull()); // non-presence

        // Clear messages
        srPanel.setMessages(null);

        /* eslint-disable-next-line */
        await waitFor(() => expect(screen.queryByTestId('message1')).toBeNull());
    });
});
