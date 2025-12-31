import { IPayByBankPixAwait } from '../Enrollment/components/PayByBankPixAwait';

export interface PaymentProps extends IPayByBankPixAwait {
    enrollmentId?: string;
    initiationId?: string;
    txVariant: string;
    onPay: () => void;
    onAuthorize: (authorizationOptions: string) => void;
    setComponentRef?: (ref) => void;
}
