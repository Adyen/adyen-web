export interface VoucherDetail {
    label: string;
    value: string;
}

export interface VoucherProps {
    paymentMethodType: string;
    imageUrl?: string;
    issuerImageUrl?: string;
    instructionsUrl?: string;
    downloadUrl?: string;
    downloadButtonText?: string;
    introduction?: string;
    reference?: string;
    barcode?: string;
    amount?: string;
    surcharge?: any;
    voucherDetails?: VoucherDetail[];
    className?: string;
    copyBtn?: boolean;
}
