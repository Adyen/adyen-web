export type UpiPaymentData = {
    paymentMethod: {
        type: 'upi_qr' | 'upi_collect';
        virtualPaymentAddress?: string;
    };
};

export enum UpiFlow {
    VPA = 'vpa',
    QR_CODE = 'qr_code'
}
