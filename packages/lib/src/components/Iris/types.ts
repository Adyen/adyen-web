import { IssuerListConfiguration, QRLoaderConfiguration } from '../types';

export type IrisConfiguration = IssuerListConfiguration &
    Pick<QRLoaderConfiguration, 'countdownTime' | 'qrCodeData' | 'paymentData' | 'delay' | 'throttleInterval' | 'throttleTime'>;

export interface IrisData {
    paymentMethod: {
        type: string;
        issuer?: string;
    };
}

export enum IrisMode {
    QR_CODE = 'qrCode',
    BANK_LIST = 'bankList'
}
