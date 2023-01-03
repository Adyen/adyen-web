import { QRLoaderContainerProps } from '../helpers/QRLoaderContainer';

export interface PixProps extends QRLoaderContainerProps {
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
