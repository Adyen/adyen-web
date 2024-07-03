import { SRPanel } from './SRPanel';
import { screen, waitFor } from '@testing-library/preact';
import { mock } from 'jest-mock-extended';
import { ICore } from '../types';

const core = mock<ICore>();

describe('SRPanel disabled', () => {
    new SRPanel(core, { enabled: false });

    test('Does not render the SRPanel in the DOM', () => {
        // Expect panel to not be present
        expect(screen.queryByTestId('ariaLiveSRPanel')).toBeNull();
    });
});

describe('SRPanel in use', () => {
    test('Renders the SRPanel in the DOM, adds & clears messages in the panel', async () => {
        const srPanel = new SRPanel(core);

        // Expect panel present - but empty
        expect(screen.getByTestId('ariaLiveSRPanel')).toBeTruthy();
        await waitFor(() => expect(screen.queryByTestId('message1')).toBeNull());

        // Set messages
        srPanel.setMessages(['message1', 'message2']);

        expect(await screen.findByTestId('message1')).toBeTruthy(); // find* queries use waitFor under the hood
        expect(await screen.findByTestId('message2')).toBeTruthy();

        // expect(await screen.findByTestId('message3')).toBeTruthy(); // KEEP: example of assertion that should fail (triggering log of available DOM)

        await screen.findByTestId('message1'); // existence
        await waitFor(() => expect(screen.queryByTestId('message3')).toBeNull()); // non-existence

        // Clear messages
        srPanel.setMessages(null);

        await waitFor(() => expect(screen.queryByTestId('message1')).toBeNull());
    });
});
