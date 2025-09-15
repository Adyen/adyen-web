import { useCoreContext } from '../Context/CoreProvider';

const useAnalytics = () => {
    const { analytics } = useCoreContext();

    if (!analytics) {
        console.warn('useAnalytics(): Analytics module is not available');
    }

    return {
        analytics
    };
};

export default useAnalytics;
