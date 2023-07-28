import { h } from 'preact';
import { screen, render, within } from '@testing-library/preact';
import { SRPanel } from '../../../../core/Errors/SRPanel';
import SRPanelProvider from '../../../../core/Errors/SRPanelProvider';
import Error from './Error';
import Success from './Success';

describe('Status', () => {
    const srPanel = new SRPanel({});
    const customRender = ui => {
        // @ts-ignore render ui as children
        return render(<SRPanelProvider srPanel={srPanel}>{ui}</SRPanelProvider>);
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
