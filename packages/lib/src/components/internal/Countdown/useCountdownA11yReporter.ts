import { useEffect, useRef } from 'preact/hooks';
import { CountdownA11yReporter } from './CountdownA11yReporter';
import useSRPanelContext from '../../../core/Errors/useSRPanelContext';
import useCoreContext from '../../../core/Context/useCoreContext';
import { CountdownTime } from './types';

export const useCountdownA11yReporter = (time: CountdownTime): void => {
    const { i18n } = useCoreContext();
    const { srPanel } = useSRPanelContext();
    const reporter = useRef<CountdownA11yReporter>(null);

    useEffect(() => {
        reporter.current = new CountdownA11yReporter({ i18n, srPanel });
        return () => {
            reporter.current.tearDown();
        };
    }, []);

    useEffect(() => {
        try {
            if (!reporter.current) return;
            reporter.current.update(time);
        } catch (e) {
            reporter.current.tearDown();
            reporter.current = null;
            throw e;
        }
    }, [time]);
};
