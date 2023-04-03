import { SRPanel } from './SRPanel';
import { screen, waitFor } from '@testing-library/preact';

describe('SRPanel disabled', () => {
    new SRPanel({ enabled: false });

    test('Does not render the SRPanel in the DOM', async () => {
        // Expect panel to not be present
        /* eslint-disable-next-line testing-library/prefer-presence-queries */ // linter is wrong: queryBy statements are designed to be used to test non-existence
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

        expect(await screen.findByTestId('message1')).toBeTruthy(); // find* queries use waitFor under the hood
        expect(await screen.findByTestId('message2')).toBeTruthy();

        // expect(await screen.findByTestId('message3')).toBeTruthy(); // KEEP: example of assertion that should fail (triggering log of available DOM)

        /* eslint-disable-next-line */ // linter is wrong:this is valid because we are waiting to test for existence
        await waitFor(() => expect(screen.queryByTestId('message1')).toBeTruthy()); // existence
        /* eslint-disable-next-line */ // linter is wrong:this is valid because we are waiting to test for non-existence
        await waitFor(() => expect(screen.queryByTestId('message3')).toBeNull()); // non-existence

        // Clear messages
        srPanel.setMessages(null);

        /* eslint-disable-next-line testing-library/prefer-find-by*/
        await waitFor(() => expect(screen.queryByTestId('message1')).toBeNull());
    });
});
