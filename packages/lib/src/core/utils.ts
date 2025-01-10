import { GENERIC_OPTIONS } from './config';
import type { CoreConfiguration } from './types';

/**
 * Filter properties in a global configuration object from an allow list (GENERIC_OPTIONS)
 * @param globalOptions -
 * @returns any
 */
export function processGlobalOptions(globalOptions) {
    return Object.keys(globalOptions).reduce((r, e) => {
        if (GENERIC_OPTIONS.includes(e)) r[e] = globalOptions[e];
        return r;
    }, {});
}

/**
 * Validates that there is no unknown property as part of the CoreConfiguration.
 * The validator makes sure to throw a lint error in case a property is added to CoreConfiguration, but it is not added here
 *
 * @param props - AdyenCheckout props
 */
export function assertConfigurationPropertiesAreValid(propsSetByMerchant: CoreConfiguration): void {
    /** Helper that creates a function that validates the array contain ALL CoreConfiguration properties in it */
    function createConfigurationKeysValidator<T>() {
        const arrayOfAll =
            <T>() =>
            <U extends T[]>(array: U & ([T] extends [U[number]] ? unknown : 'Invalid')) =>
                array;
        const arrayWithAllKeys = arrayOfAll<T>();
        return arrayWithAllKeys;
    }

    const validator = createConfigurationKeysValidator<keyof CoreConfiguration>();
    const possibleFields = validator([
        'session',
        'environment',
        '_environmentUrls',
        'showPayButton',
        'clientKey',
        'locale',
        'translations',
        'paymentMethodsResponse',
        'amount',
        'secondaryAmount',
        'countryCode',
        'allowPaymentMethods',
        'removePaymentMethods',
        'srConfig',
        'analytics',
        'risk',
        'order',
        'exposeLibraryMetadata',
        'beforeRedirect',
        'beforeSubmit',
        'onPaymentCompleted',
        'onPaymentFailed',
        'onSubmit',
        'onAdditionalDetails',
        'onActionHandled',
        'onChange',
        'onError',
        'onBalanceCheck',
        'onOrderRequest',
        'onPaymentMethodsRequest',
        'onOrderCancel',
        'onOrderUpdated',
        'loadingContext',
        'onEnterKeyPressed'
    ]);

    Object.keys(propsSetByMerchant).forEach((prop: keyof CoreConfiguration) => {
        if (!possibleFields.includes(prop)) {
            console.warn(
                `AdyenCheckout - Configuration property "${prop}" is not a valid AdyenCheckout property. If it is a payment method configuration, make sure to pass it directly to the Component. If you are using Drop-in, make sure to pass it to "paymentMethodsConfiguration" object`
            );
        }
    });
}

/**
 * TODO: Check if this is correct place
 * Type guard for enums, helpful to make sure strings keep enum value
 * Comes from this: https://github.com/microsoft/TypeScript/issues/30611#issuecomment-570773496
 * @param enumVariable
 */
export function createEnumChecker<T extends string, TEnumValue extends string>(enumVariable: { [key in T]: TEnumValue }) {
    const enumValues = Object.values(enumVariable);
    return (value: string): value is TEnumValue => enumValues.includes(value);
}
