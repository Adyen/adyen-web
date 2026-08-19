import { TxVariants } from '../tx-variants';
import { EMIFundingSource } from './types';

export const SUPPORTED_FUNDING_SOURCES: Record<string, EMIFundingSource> = {
    [TxVariants.scheme]: EMIFundingSource.CARD
};
