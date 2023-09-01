import AchTxVariant from './Ach/tx-variant';
import AfterPayTxVariant from './AfterPay/tx-variant';
import AffirmTxVariant from './Affirm/tx-variant';

/**
 * Export all txVariants that the current library Components support.
 *
 * These txVariants are used in the 'core.registry', in order to properly warn the merchant
 * if he misses registering a specific Component
 */
export default [...AchTxVariant.txVariants, ...AfterPayTxVariant.txVariants, ...AffirmTxVariant.txVariants];
