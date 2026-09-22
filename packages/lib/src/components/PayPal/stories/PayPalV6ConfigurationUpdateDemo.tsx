import { Fragment, h } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Checkout } from '../../../../storybook/components/Checkout';
import { ComponentContainer } from '../../../../storybook/components/ComponentContainer';
import Paypal from '..';

import type { GlobalStoryProps } from '../../../../storybook/types';
import type { ICore } from '../../../core/types';
import type { PayPalConfiguration } from '../types';
import styles from './PayPalV6ConfigurationUpdateDemo.module.scss';

interface ConfigurationPreset {
    label: string;
    countryCode: string;
    currency: string;
    value: number;
    locale: string;
}

/**
 * Each preset changes props the PayPal SDK instance and the eligible payment methods are derived from:
 * the 'locale' and the 'countryCode' are used to create the SDK instance, whereas the currency, the country
 * code and the payment flow are used to look up the eligible payment methods.
 *
 * @remarks
 * These values only drive the PayPal SDK instance and the eligibility lookup. The payment itself is made
 * with the amount and the currency of the session, which are fixed when the checkout is created from the
 * story args, so switching preset does not change what the shopper is actually charged.
 */
const CONFIGURATION_PRESETS: ConfigurationPreset[] = [
    { label: 'United States', countryCode: 'US', currency: 'USD', value: 2200, locale: 'en-US' },
    { label: 'United Kingdom', countryCode: 'GB', currency: 'GBP', value: 1800, locale: 'en-GB' }
];

const getPaymentFlow = (vault: boolean, isZeroAuth: boolean) => {
    if (isZeroAuth) return 'VAULT_WITHOUT_PAYMENT';
    if (vault) return 'VAULT_WITH_PAYMENT';
    return 'one-time payment';
};

const getConfiguration = (
    componentConfiguration: PayPalConfiguration | undefined,
    preset: ConfigurationPreset,
    vault: boolean,
    isZeroAuth: boolean
): PayPalConfiguration => ({
    ...componentConfiguration,
    countryCode: preset.countryCode,
    amount: { currency: preset.currency, value: isZeroAuth ? 0 : preset.value },
    usePayPalV6: {
        ...componentConfiguration?.usePayPalV6,
        vault,
        locale: preset.locale
    }
});

const buttonClassName = (isSelected: boolean) => `${styles.optionButton} ${isSelected ? styles.optionButtonSelected : ''}`;

/**
 * Creates the PayPal element once and routes every later configuration change through 'paypal.update(props)'.
 */
function PayPalUpdatableElement({
    checkout,
    componentConfiguration,
    preset,
    vault,
    isZeroAuth,
    onReady
}: Readonly<{
    checkout: ICore;
    componentConfiguration?: PayPalConfiguration;
    preset: ConfigurationPreset;
    vault: boolean;
    isZeroAuth: boolean;
    onReady: () => void;
}>) {
    const paypal = useMemo(
        () => new Paypal(checkout, getConfiguration(componentConfiguration, preset, vault, isZeroAuth)),
        // The component is created only once, every later configuration change goes through 'update'
        [checkout]
    );

    useEffect(() => {
        paypal.isAvailable().then(onReady).catch(onReady);
    }, [paypal]);

    const isInitialRenderRef = useRef(true);

    useEffect(() => {
        if (isInitialRenderRef.current) {
            isInitialRenderRef.current = false;
            return;
        }

        console.log('Updating the PayPal configuration', { countryCode: preset.countryCode, vault, isZeroAuth });
        console.log('Configuration', getConfiguration(componentConfiguration, preset, vault, isZeroAuth));
        paypal.update(getConfiguration(componentConfiguration, preset, vault, isZeroAuth));
    }, [paypal, preset, vault, isZeroAuth]);

    return <ComponentContainer element={paypal} />;
}

/**
 * Demonstrates that 'paypal.update(props)' refreshes the PayPal SDK instance and the eligible payment methods.
 * The country and the vault controls update props that PayPal derives its state from, so the SDK instance is
 * re-created and the buttons are re-rendered against it.
 *
 * Zero-auth is the exception: the PayPal save payment session exchanges the token returned by the '/payments'
 * call for a vault setup token, and the backend only issues one for a zero-amount payment. That amount comes
 * from the session, not from the component props, so toggling zero-auth re-creates the whole checkout with an
 * amount of 0 instead of going through 'update'.
 */
export function PayPalV6ConfigurationUpdateDemo({
    checkoutConfig,
    componentConfiguration
}: Readonly<{
    checkoutConfig: GlobalStoryProps;
    componentConfiguration?: PayPalConfiguration;
}>) {
    const [presetIndex, setPresetIndex] = useState(0);
    const [vault, setVault] = useState(false);
    const [isZeroAuth, setIsZeroAuth] = useState(false);
    const [isReady, setIsReady] = useState(false);

    const preset = CONFIGURATION_PRESETS[presetIndex];

    const sessionCheckoutConfig = useMemo(
        () => ({ ...checkoutConfig, amount: isZeroAuth ? 0 : checkoutConfig.amount }),
        [checkoutConfig, isZeroAuth]
    );

    const toggleZeroAuth = () => {
        setIsReady(false);
        setIsZeroAuth(!isZeroAuth);
    };

    return (
        <Fragment>
            <div className={styles.configurationPanel}>
                <div className={styles.controlRow}>
                    {CONFIGURATION_PRESETS.map((configurationPreset, index) => (
                        <button
                            key={configurationPreset.countryCode}
                            disabled={!isReady}
                            onClick={() => setPresetIndex(index)}
                            className={buttonClassName(index === presetIndex)}
                        >
                            {configurationPreset.label}
                        </button>
                    ))}
                </div>

                <div className={styles.controlRow}>
                    <button disabled={!isReady || isZeroAuth} onClick={() => setVault(!vault)} className={buttonClassName(vault)}>
                        Vault: {vault ? 'on' : 'off'}
                    </button>
                    <button disabled={!isReady} onClick={toggleZeroAuth} className={buttonClassName(isZeroAuth)}>
                        Zero-auth: {isZeroAuth ? 'on' : 'off'}
                    </button>
                </div>

                <div>
                    Country: <b>{preset.countryCode}</b> | Locale: <b>{preset.locale}</b> | Amount:{' '}
                    <b>
                        {isZeroAuth ? 0 : preset.value} {preset.currency}
                    </b>{' '}
                    | Payment flow: <b>{getPaymentFlow(vault, isZeroAuth)}</b>
                </div>
            </div>

            {/* Keyed on the payment flow: switching to or from zero-auth needs a new session, so the whole
                checkout is re-created instead of the props being updated. */}
            <Checkout key={isZeroAuth ? 'zero-auth' : 'payment'} checkoutConfig={sessionCheckoutConfig}>
                {checkout => (
                    <PayPalUpdatableElement
                        checkout={checkout}
                        componentConfiguration={componentConfiguration}
                        preset={preset}
                        vault={vault}
                        isZeroAuth={isZeroAuth}
                        onReady={() => setIsReady(true)}
                    />
                )}
            </Checkout>
        </Fragment>
    );
}
