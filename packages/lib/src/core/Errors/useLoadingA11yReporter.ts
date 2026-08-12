import { useCoreContext } from '../Context/CoreProvider';
import { useA11yReporter } from './useA11yReporter';

/**
 * Announces loading transitions to screen readers, for components whose spinner has no
 * accessible name of its own.
 *
 * The terminal message is required rather than cosmetic: the SR panel is shared and is
 * deliberately not cleared when a reporter unmounts, so without something to supersede it the
 * "loading" announcement would be left on display after loading has finished.
 *
 * Call this from a component that stays mounted across the whole transition. Calling it from a
 * component that only exists while loading cannot work, because it unmounts before it is able
 * to announce the terminal message.
 *
 * @param isLoading - whether the component is currently loading
 * @param finalMessage - announced instead of the generic "loaded" once loading ends, e.g. a payment result
 */
export const useLoadingA11yReporter = (isLoading: boolean, finalMessage?: string): void => {
    const { i18n } = useCoreContext();

    useA11yReporter(isLoading ? i18n.get('loading') : (finalMessage ?? i18n.get('loaded')));
};
