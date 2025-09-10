import { h } from 'preact';
import IssuerListContainer from './IssuerListContainer';
import { render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';

describe('IssuerListContainer: Multiple instances focus behavior', () => {
    test('Pressing Continue button on second IssuerListContainer should focus on that specific IssuerList input', async () => {
        const items = [
            { name: 'Issuer 1', id: '1' },
            { name: 'Issuer 2', id: '2' },
            { name: 'Issuer 3', id: '3' }
        ];

        // Create two IssuerListContainer instances
        const issuerListContainer1 = new IssuerListContainer(global.core, {
            issuers: items,
            showPayButton: true,
            i18n: global.i18n,
            loadingContext: 'test',
            modules: { resources: global.resources, srPanel: global.srPanel }
        });

        const issuerListContainer2 = new IssuerListContainer(global.core, {
            issuers: items,
            showPayButton: true,
            i18n: global.i18n,
            loadingContext: 'test',
            modules: { resources: global.resources, srPanel: global.srPanel }
        });

        render(
            <div>
                {issuerListContainer1.render()}
                {issuerListContainer2.render()}
            </div>
        );

        // Verify we have 2 IssuerList components by checking for multiple dropdowns
        const issuerListContainers = screen.getAllByRole('combobox');
        expect(issuerListContainers).toHaveLength(2);
        const firstIssuerListInput = issuerListContainers[0];
        const secondIssuerListInput = issuerListContainers[1];

        // Press the Continue button on the second IssuerListContainer (without selecting an issuer first to trigger validation error)
        const user = userEvent.setup();
        await user.click(screen.getAllByRole('button', { name: 'Continue' })[1]);

        // Verify that the second IssuerList's input has focus, not the first one
        // This tests that our fix correctly scopes the focus to the specific component instance
        await waitFor(() => {
            expect(secondIssuerListInput).toHaveFocus();
        });
        expect(firstIssuerListInput).not.toHaveFocus();
    });
});
