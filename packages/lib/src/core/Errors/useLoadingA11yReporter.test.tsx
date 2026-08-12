import { h } from 'preact';
import { render } from '@testing-library/preact';
import { CoreProvider } from '../Context/CoreProvider';
import SRPanelProvider from './SRPanelProvider';
import { SRPanel } from './SRPanel';
import { useLoadingA11yReporter } from './useLoadingA11yReporter';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';

const Consumer = ({ isLoading, finalMessage }: Readonly<{ isLoading: boolean; finalMessage?: string }>) => {
    useLoadingA11yReporter(isLoading, finalMessage);
    return null;
};

const renderConsumer = (srPanel: SRPanel, isLoading: boolean, finalMessage?: string) =>
    render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <SRPanelProvider srPanel={srPanel}>
                <Consumer isLoading={isLoading} finalMessage={finalMessage} />
            </SRPanelProvider>
        </CoreProvider>
    );

describe('useLoadingA11yReporter', () => {
    test('reports the loading message while loading', () => {
        const srPanel = setupCoreMock().modules.srPanel;
        const setMessagesSpy = jest.spyOn(srPanel, 'setMessages');

        renderConsumer(srPanel, true);

        expect(setMessagesSpy).toHaveBeenCalledWith('Loading…');
    });

    /**
     * The panel is not cleared when a reporter unmounts, so a terminal message is the only thing
     * that removes "Loading…" from the live region once loading has finished.
     */
    test('supersedes the loading message once loading finishes', () => {
        const srPanel = setupCoreMock().modules.srPanel;
        const setMessagesSpy = jest.spyOn(srPanel, 'setMessages');

        const { rerender } = renderConsumer(srPanel, true);
        expect(setMessagesSpy).toHaveBeenCalledWith('Loading…');

        rerender(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                <SRPanelProvider srPanel={srPanel}>
                    <Consumer isLoading={false} />
                </SRPanelProvider>
            </CoreProvider>
        );

        expect(setMessagesSpy).toHaveBeenCalledWith('Loaded');
    });

    test('announces a final message in place of the generic loaded message', () => {
        const srPanel = setupCoreMock().modules.srPanel;
        const setMessagesSpy = jest.spyOn(srPanel, 'setMessages');

        renderConsumer(srPanel, false, 'Payment Successful');

        expect(setMessagesSpy).toHaveBeenCalledWith('Payment Successful');
        expect(setMessagesSpy).not.toHaveBeenCalledWith('Loaded');
    });
});
