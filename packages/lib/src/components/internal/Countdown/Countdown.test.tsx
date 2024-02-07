import { h } from 'preact';
import Countdown from './index';
import { render, screen } from '@testing-library/preact';
import { SRPanel } from '../../../core/Errors/SRPanel';
import SRPanelProvider from '../../../core/Errors/SRPanelProvider';
import CoreProvider from '../../../core/Context/CoreProvider';

describe('Countdown', () => {
    const srPanel = new SRPanel(global.core);
    const customRender = ui => {
        // @ts-ignore render ui as children
        return render(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                <SRPanelProvider srPanel={srPanel}>{ui}</SRPanelProvider>)
            </CoreProvider>
        );
    };

    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    test('should render a countdown timer', () => {
        customRender(<Countdown minutesFromNow={1} />);
        expect(screen.getByRole('timer')).toBeVisible();
    });

    test('should call onTick after 1 second', () => {
        const onTickMock = jest.fn();
        customRender(<Countdown minutesFromNow={1} onTick={onTickMock} />);
        expect(onTickMock).not.toBeCalled();

        jest.advanceTimersByTime(1000);
        expect(onTickMock).toBeCalled();
        expect(onTickMock).toHaveBeenCalledTimes(1);
    });

    test('should call onCompleted when time is up', () => {
        const onCompletedMock = jest.fn();
        customRender(<Countdown minutesFromNow={1} onCompleted={onCompletedMock} />);
        expect(onCompletedMock).not.toBeCalled();

        jest.advanceTimersByTime(60_000);
        expect(onCompletedMock).toBeCalled();
        expect(onCompletedMock).toHaveBeenCalledTimes(1);
    });

    test('should send countdown message to the SR panel on time update', async () => {
        customRender(<Countdown minutesFromNow={1} />);
        jest.advanceTimersByTime(2000);
        expect(await screen.findByText('You have 58 seconds to pay')).toBeTruthy();
    });
});
