import { TxVariants } from '../tx-variants';
import { EMISupportedPaymentMethod } from './types';

export const SUPPORTED_PAYMENT_METHODS: Record<string, EMISupportedPaymentMethod> = {
    [TxVariants.scheme]: EMISupportedPaymentMethod.CARD
};
