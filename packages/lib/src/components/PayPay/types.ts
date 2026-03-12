import { UIElementProps } from '../internal/UIElement/types';

export interface PayPayConfiguration extends UIElementProps {
    configuration: {
        clientId: string;
    };
}

export type PayPayInitOptions = {
    clientId: string;
    environment: 'sandbox' | 'production';
    success: (res: unknown) => void;
    fail: (res: unknown) => void;
};
