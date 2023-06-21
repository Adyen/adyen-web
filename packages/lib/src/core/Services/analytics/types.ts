import { PaymentAmount } from '../../../types';

type CheckoutAttemptIdSession = {
    id: string;
    timestamp: number;
};

type CollectIdProps = {
    clientKey: string;
    analyticsContext: string;
    locale: string;
    amount: PaymentAmount;
};

export { CheckoutAttemptIdSession, CollectIdProps };
