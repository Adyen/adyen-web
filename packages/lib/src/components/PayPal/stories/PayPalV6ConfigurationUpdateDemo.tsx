import { Fragment, h } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { ComponentContainer } from '../../../../storybook/components/ComponentContainer';
import Paypal from '..';

import type { ICore } from '../../../core/types';
import type { PayPalConfiguration } from '../types';

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

const buttonStyle = (isSelected: boolean) => ({
    padding: '8px 12px',
    marginRight: '8px',
    borderRadius: '4px',
    border: `1px solid ${isSelected ? '#0abf53' : '#ddd'}`,
    backgroundColor: isSelected ? '#e6f4ea' : '#fff',
    fontWeight: isSelected ? 'bold' : 'normal',
    cursor: 'pointer'
});

/**
 * Demonstrates that 'paypal.update(props)' refreshes the PayPal SDK instance and the eligible payment methods.
 * Every control below updates props that PayPal derives its state from, so the component re-mounts and the
 * buttons are re-created against a brand new SDK instance.
 */
export function PayPalV6ConfigurationUpdateDemo({
    checkout,
    componentConfiguration
}: Readonly<{
    checkout: ICore;
    componentConfiguration?: PayPalConfiguration;
}>) {
    const [presetIndex, setPresetIndex] = useState(0);
    const [vault, setVault] = useState(false);
    const [isZeroAuth, setIsZeroAuth] = useState(false);
    const [isReady, setIsReady] = useState(false);

    const preset = CONFIGURATION_PRESETS[presetIndex];

    const getConfiguration = (preset: ConfigurationPreset, vault: boolean, isZeroAuth: boolean): PayPalConfiguration => ({
        ...componentConfiguration,
        countryCode: preset.countryCode,
        amount: { currency: preset.currency, value: isZeroAuth ? 0 : preset.value },
        usePayPalV6: {
            ...componentConfiguration?.usePayPalV6,
            vault,
            locale: preset.locale
        }
    });

    const paypal = useMemo(
        () => new Paypal(checkout, getConfiguration(CONFIGURATION_PRESETS[0], false, false)),
        // The component is created only once, every later configuration change goes through 'update'
        [checkout]
    );

    useEffect(() => {
        paypal
            .isAvailable()
            .then(() => setIsReady(true))
            .catch(() => setIsReady(true));
    }, [paypal]);

    const isInitialRenderRef = useRef(true);

    useEffect(() => {
        if (isInitialRenderRef.current) {
            isInitialRenderRef.current = false;
            return;
        }

        console.log('Updating the PayPal configuration', { countryCode: preset.countryCode, vault, isZeroAuth });
        paypal.update(getConfiguration(preset, vault, isZeroAuth));
    }, [paypal, preset, vault, isZeroAuth]);

    return (
        <Fragment>
            <div style={{ marginBottom: '20px', padding: '16px', border: '1px solid #001222', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
                <div style={{ marginBottom: '12px' }}>
                    {CONFIGURATION_PRESETS.map((configurationPreset, index) => (
                        <button
                            key={configurationPreset.countryCode}
                            disabled={!isReady}
                            onClick={() => setPresetIndex(index)}
                            style={buttonStyle(index === presetIndex)}
                        >
                            {configurationPreset.label}
                        </button>
                    ))}
                </div>

                <div style={{ marginBottom: '12px' }}>
                    <button disabled={!isReady} onClick={() => setVault(!vault)} style={buttonStyle(vault)}>
                        Vault: {vault ? 'on' : 'off'}
                    </button>
                    <button disabled={!isReady} onClick={() => setIsZeroAuth(!isZeroAuth)} style={buttonStyle(isZeroAuth)}>
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

            <ComponentContainer element={paypal} />
        </Fragment>
    );
}
