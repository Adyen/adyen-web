import { useCoreContext } from '../Context/CoreProvider';
import AdyenCheckoutError from '../Errors/AdyenCheckoutError';

const useAnalytics = () => {
    const { analytics } = useCoreContext();

    if (analytics === undefined) {
        throw new AdyenCheckoutError('SDK_ERROR', 'useAnalytics(): analytics module is not defined');
    }

    return {
        analytics
    };
};

export default useAnalytics;
