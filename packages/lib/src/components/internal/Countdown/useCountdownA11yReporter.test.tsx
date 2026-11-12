import { h } from 'preact';
import { render } from '@testing-library/preact';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import SRPanelProvider from '../../../core/Errors/SRPanelProvider';
import { setupCoreMock } from '../../../../config/testMocks/setup-core-mock';
import { useCountdownA11yReporter } from './useCountdownA11yReporter';
import { CountdownA11yReporter } from './CountdownA11yReporter';
import type { CountdownTime } from './types';

const core = setupCoreMock();

const Probe = ({ time }: Readonly<{ time: CountdownTime }>) => {
    useCountdownA11yReporter(time);
    return null;
};

const withCoreOnly = (time: CountdownTime) => (
    <CoreProvider i18n={core.modules.i18n} loadingContext="test" resources={core.modules.resources}>
        <Probe time={time} />
    </CoreProvider>
);

const withSRPanel = (time: CountdownTime) => (
    <CoreProvider i18n={core.modules.i18n} loadingContext="test" resources={core.modules.resources}>
        <SRPanelProvider srPanel={core.modules.srPanel}>
            <Probe time={time} />
        </SRPanelProvider>
    </CoreProvider>
);

describe('useCountdownA11yReporter', () => {
    test('should not throw when rendered outside an SRPanelProvider', () => {
        expect(() => {
            const { rerender, unmount } = render(withCoreOnly({ minutes: 2, seconds: 0, percentage: 100 }));
            rerender(withCoreOnly({ minutes: 1, seconds: 59, percentage: 99 }));
            unmount();
        }).not.toThrow();
    });

    test('should not throw on unmount after the reporter failed to update', () => {
        const { rerender, unmount } = render(withSRPanel({ minutes: 2, seconds: 0, percentage: 100 }));
        const updateSpy = jest.spyOn(CountdownA11yReporter.prototype, 'update').mockImplementation(() => {
            throw new Error('update failed');
        });

        expect(() => rerender(withSRPanel({ minutes: 1, seconds: 59, percentage: 99 }))).toThrow('update failed');
        expect(() => unmount()).not.toThrow();

        updateSpy.mockRestore();
    });
});
