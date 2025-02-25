export interface PaymentProps {
    receiver: string;
    paymentDate: string;
    paymentMethod: string;
    amount: { value: number; currency: string };
    txVariant: string;
    issuer: string;
    onPay: () => void;
    setComponentRef?: (ref) => void;
}
