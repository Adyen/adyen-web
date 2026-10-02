import type { UIElementProps } from '../internal/UIElement/types';

export interface KlarnaNetworkConfiguration extends UIElementProps {
    clientId: string;
    partnerAccountId?: string;
    paymentAccountId?: string;
}
