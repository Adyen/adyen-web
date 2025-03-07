export interface PaymentProps {
    enrollmentId?: string;
    initiationId?: string;
    receiver: string;
    paymentDate: string;
    paymentMethod: string;
    amount: { value: number; currency: string };
    txVariant: string;
    clientKey: string;
    issuer: string;
    onPay: () => void;
    onAuthorize: (authorizationOptions: string) => void;
    setComponentRef?: (ref) => void;
}
