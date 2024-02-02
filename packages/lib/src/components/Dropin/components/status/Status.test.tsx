import { h } from 'preact';
import { screen, render, within } from '@testing-library/preact';
import { SRPanel } from '../../../../core/Errors/SRPanel';
import SRPanelProvider from '../../../../core/Errors/SRPanelProvider';
import Error from './Error';
import Success from './Success';
import CoreProvider from '../../../../core/Context/CoreProvider';

describe('Status', () => {
    const srPanel = new SRPanel(global.core);
    const customRender = ui => {
        return render(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                <SRPanelProvider srPanel={srPanel}>{ui}</SRPanelProvider>
            </CoreProvider>
        );
    };

    describe('Error status', () => {
        test('should report the error status to the sr panel', () => {
            customRender(<Error message={'Error message'} />);
            const panel = screen.getByRole('log');
            expect(within(panel).getByText('Error message')).toBeTruthy();
        });
    });

    describe('Success status', () => {
        test('should report the success status to the sr panel', () => {
            customRender(<Success message={'Success message'} />);
            const panel = screen.getByRole('log');
            expect(within(panel).getByText('Success message')).toBeTruthy();
        });
    });
});
