import { IPayByBankPixAwait } from '../Enrollment/components/PayByBankPixAwait';

export interface PaymentProps extends IPayByBankPixAwait {
    enrollmentId?: string;
    initiationId?: string;
    receiver: string;
    amount: { value: number; currency: string };
    txVariant: string;

    issuer: string;
    onPay: () => void;
    onAuthorize: (authorizationOptions: string) => void;
    setComponentRef?: (ref) => void;
}
