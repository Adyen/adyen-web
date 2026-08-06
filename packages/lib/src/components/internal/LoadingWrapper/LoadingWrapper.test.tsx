import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import LoadingWrapper from './LoadingWrapper';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import SRPanelProvider from '../../../core/Errors/SRPanelProvider';
import { SRPanel } from '../../../core/Errors/SRPanel';
import { setupCoreMock } from '../../../../config/testMocks/setup-core-mock';

// The SRPanel is a singleton owned by the Core instance (core.modules.srPanel), injected into
// components via SRPanelProvider - mirror that here instead of constructing an SRPanel directly.
const renderLoadingWrapper = (status?: string, srPanel: SRPanel = setupCoreMock().modules.srPanel) => {
    render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <SRPanelProvider srPanel={srPanel}>
                <LoadingWrapper status={status}>
                    <div data-testid="child-content">Content</div>
                </LoadingWrapper>
            </SRPanelProvider>
        </CoreProvider>
    );
};

describe('LoadingWrapper', () => {
    test('should render its children', () => {
        renderLoadingWrapper('ready');
        expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    describe('Accessibility', () => {
        test('should report the loading status to the SRPanel while status is loading', () => {
            const srPanel = setupCoreMock().modules.srPanel;
            const setMessagesSpy = jest.spyOn(srPanel, 'setMessages');

            renderLoadingWrapper('loading', srPanel);

            expect(setMessagesSpy).toHaveBeenCalledWith('Loading…');
        });

        test('should not report a loading message when status is not loading', () => {
            const srPanel = setupCoreMock().modules.srPanel;
            const setMessagesSpy = jest.spyOn(srPanel, 'setMessages');

            renderLoadingWrapper('ready', srPanel);

            expect(setMessagesSpy).not.toHaveBeenCalledWith('Loading…');
        });
    });
});
