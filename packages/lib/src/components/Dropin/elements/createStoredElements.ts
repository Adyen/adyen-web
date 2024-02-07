import createElements from './createElements';
import type { StoredPaymentMethod } from '../../../types/global-types';
import type { ICore } from '../../../core/types';
import type { PaymentMethodsConfiguration } from '../types';
import type { IUIElement } from '../../internal/UIElement/types';

/**
 * Returns a filtered (available) list of oneClick paymentMethod Elements
 *
 * @param paymentMethods - Array of PaymentMethod objects from the /paymentMethods response
 * @param paymentMethodsConfiguration - Dropin paymentMethodsConfiguration object
 * @param commonProps - High level props to be passed through to every component
 * @param core - Reference to the checkout core object
 */
const createStoredElements = (
    paymentMethods: StoredPaymentMethod[] = [],
    paymentMethodsConfiguration: PaymentMethodsConfiguration,
    commonProps,
    core: ICore
): Promise<IUIElement[]> => createElements(paymentMethods, paymentMethodsConfiguration, { ...commonProps, oneClick: true }, core);

export default createStoredElements;
