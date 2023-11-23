import { QRLoaderConfiguration } from '../helpers/QRLoaderContainer/types';

export interface PixConfiguration extends QRLoaderConfiguration {
    personalDetailsRequired?: boolean;
}

export interface PixElementData {
    paymentMethod: {
        type: 'pix';
    };
    shopperName?: {
        firstName: string;
        lastName: string;
    };
    socialSecurityNumber?: string;
}
