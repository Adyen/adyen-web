declare global {
    interface Window {
        amazon: object;
    }
}

export interface AmazonElementProps {
    merchantId?: string;
    currency?: string;
    environment?: string;
    locale?: string;
    placement?: 'Home' | 'Product' | 'Cart' | 'Checkout' | 'Other';
    productType?: 'PayOnly' | 'PayAndShip';
    region?: 'EU' | 'UK' | 'US';
    sessionUrl?: string;
    showPayButton: boolean;
}
