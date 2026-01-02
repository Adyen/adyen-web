import { IssuerListConfiguration, QRLoaderConfiguration } from '../types';

export type IrisConfiguration = IssuerListConfiguration & Pick<QRLoaderConfiguration, 'countdownTime' | 'qrCodeData' | 'paymentData' | 'delay'>;

/**
 * Iris data format for /payment request
 * @internal
 */
export interface IrisData {
    paymentMethod: {
        type: string;
        issuer?: string;
    };
}

/**
 * Iris component display modes
 * @internal
 */
export enum IrisMode {
    QR_CODE = 'qrCode',
    BANK_LIST = 'bankList'
}
