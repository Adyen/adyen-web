import { UIElementProps } from '../types';

export interface CashAppPayElementProps extends UIElementProps {
    /**
     * A reference to your system (for example, a cart or checkout identifier). Maximum length 1024 characters.
     * https://developers.cash.app/docs/api/technical-documentation/sdks/pay-kit/technical-reference#parameters-3
     */
    referenceId?: string;
    /**
     * The destination for the customer after approving (or declining) in Cash App for mobile redirect flow.
     * https://developers.cash.app/docs/api/technical-documentation/sdks/pay-kit/technical-reference#customerrequest
     * @defaultValue window.location.ref
     */
    redirectURL?: string;
    /**
     * Button customization
     * https://developers.cash.app/docs/api/technical-documentation/sdks/pay-kit/use-cases#customize-the-cash-app-pay-button
     */
    button?: {
        shape?: 'semiround' | 'round';
        size?: 'medium' | 'small';
        theme?: 'dark' | 'light';
        width?: 'static' | 'full';
    };

    configuration: {
        clientId: string;
        scopeId: string;
    };
}
