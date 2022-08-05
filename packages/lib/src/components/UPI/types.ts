export type UpiPaymentData = {
    paymentMethod: {
        type: 'upi_qr' | 'upi_collect';
        virtualPaymentAddress?: string;
    };
};
