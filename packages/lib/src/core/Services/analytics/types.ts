import { Experiment } from '../../Analytics/types';

type CheckoutAttemptIdSession = {
    id: string;
    timestamp: number;
};

type CollectIdProps = {
    clientKey: string;
    loadingContext: string;
    experiments: Experiment[];
};

export { CheckoutAttemptIdSession, CollectIdProps };
