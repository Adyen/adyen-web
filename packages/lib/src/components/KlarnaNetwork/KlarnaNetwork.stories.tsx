import { h } from 'preact';
import KlarnaNetwork from './KlarnaNetwork';
import { Checkout } from '../../../storybook/components/Checkout';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { COUNTRY_CODES } from '../../../storybook/constants/countries';
import { KlarnaCredentialsGate } from './stories/KlarnaCredentialsForm';

import type { Meta, StoryObj } from '@storybook/preact-vite';
import type { GlobalStoryProps } from '../../../storybook/types';
import type { KlarnaNetworkConfiguration, KlarnaPayButtonVariant } from './types';
import type { KlarnaButtonLogoAlignment, KlarnaButtonShape, KlarnaButtonTheme, KlarnaInitiationMode } from './klarna-web-sdk-types';

/**
 * Credentials are collected by an in-story form rather than by Storybook args, because Storybook
 * mirrors changed args into the URL.
 */
type KlarnaNetworkStoryProps = GlobalStoryProps & {
    sendKlarnaNetworkData: boolean;
    payButtonVariant: KlarnaPayButtonVariant;
    theme: KlarnaButtonTheme;
    shape: KlarnaButtonShape;
    logoAlignment: KlarnaButtonLogoAlignment;
    initiationMode: KlarnaInitiationMode;
};

type Story = StoryObj<KlarnaNetworkStoryProps>;

const render = (args: KlarnaNetworkStoryProps) => {
    const { sendKlarnaNetworkData, payButtonVariant, theme, shape, logoAlignment, initiationMode, ...checkoutConfig } = args;

    return (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => (
                <KlarnaCredentialsGate>
                    {credentials => {
                        const componentConfiguration: KlarnaNetworkConfiguration = {
                            ...credentials,
                            sendKlarnaNetworkData,
                            payButtonVariant,
                            klarnaButtonStyle: { theme, shape, logoAlignment, initiationMode }
                        };

                        return <ComponentContainer element={new KlarnaNetwork(checkout, componentConfiguration)} />;
                    }}
                </KlarnaCredentialsGate>
            )}
        </Checkout>
    );
};

const meta: Meta<KlarnaNetworkStoryProps> = {
    title: 'Components/KlarnaNetwork',
    parameters: {
        docs: {
            description: {
                component: [
                    'Proof of concept for the Klarna Network Distribution Web SDK.',
                    '',
                    'Paste a Klarna `clientId` into the form above the component and press Initialise Klarna. The',
                    'form is used instead of the controls panel so that credentials never reach the URL, browser',
                    'history or a Storybook build, and nothing is seeded from the environment, so they have to be',
                    're-entered after every reload.',
                    '',
                    'Klarna picks its regional endpoint from the currency, so keep `countryCode` on `US`: the test',
                    'accounts are NA only and EUR answers `404 RESOURCE_NOT_FOUND` on `/eu`.',
                    '',
                    "Klarna's presentation API answers `401 PERMISSION_DENIED` for Adyen's acquiring `clientId`, and",
                    'the SDK hides that by substituting a hardcoded fallback presentation, so the widgets render with',
                    'no Klarna session behind them. The component detects this and warns on the console.',
                    '',
                    'A plain merchant `clientId`, with both account id fields left empty, does get a real',
                    'presentation from the very same origin, in both a top-level page and an iframe. So the domain',
                    'is allowlisted and the 401 is a missing entitlement on the acquiring credential alone; sending',
                    'or omitting the acquiring config changes nothing.',
                    '',
                    'The component submits the intended Klarna Network contract by default:',
                    '`type: klarna_network` plus `klarnaNetworkSessionToken` and `paymentOptionId`. Adyen\u2019s',
                    '`/payments` supports none of it yet, and rejects the two fields with `400 errorCode 702`.',
                    'These stories therefore turn `sendKlarnaNetworkData` off to match what the backend accepts',
                    'today. The captured values are logged either way, together with the raw response.',
                    '',
                    'Paying therefore cannot complete. `/payments` answers `RedirectShopper` with an Adyen-hosted',
                    'redirect URL, and Klarna rejects it with "Invalid paymentRequestUrl: cannot extract access',
                    'token or region". Klarna needs a payment request URL minted by its own Payment Request API.'
                ].join('\n')
            }
        }
    },
    argTypes: {
        sendKlarnaNetworkData: { control: 'boolean' },
        payButtonVariant: {
            control: 'select',
            options: ['klarna', 'adyen'] satisfies KlarnaPayButtonVariant[]
        },
        theme: {
            control: 'select',
            options: ['default', 'light', 'dark', 'outlined'] satisfies KlarnaButtonTheme[]
        },
        shape: {
            control: 'select',
            options: ['default', 'pill', 'rect'] satisfies KlarnaButtonShape[]
        },
        logoAlignment: {
            control: 'select',
            options: ['default', 'left', 'center'] satisfies KlarnaButtonLogoAlignment[]
        },
        initiationMode: {
            control: 'select',
            options: ['DEVICE_BEST', 'REDIRECT', 'ON_PAGE', 'POPUP'] satisfies KlarnaInitiationMode[]
        }
    },
    args: {
        // Klarna derives its regional endpoint from the currency, and the test accounts behind these
        // credentials are NA only: EUR answers 404 RESOURCE_NOT_FOUND on /eu, USD reaches /na.
        countryCode: COUNTRY_CODES.UnitedStates,
        sendKlarnaNetworkData: false,
        payButtonVariant: 'klarna',
        theme: 'default',
        shape: 'default',
        logoAlignment: 'default',
        initiationMode: 'DEVICE_BEST'
    },
    render
};

export default meta;

/** Option 1: the native pay button returned by the Klarna presentation. */
export const KlarnaNativeButton: Story = {
    args: {
        payButtonVariant: 'klarna',
        showPayButton: true
    }
};

/** Option 2: the standard Adyen PayButton, which triggers `klarna.Payment.initiate()` on click. */
export const AdyenPayButton: Story = {
    args: {
        payButtonVariant: 'adyen',
        showPayButton: true
    }
};

/**
 * Option 3: no button rendered by Adyen. The merchant owns the button and calls
 * `component.submit()` from its click handler, which must happen synchronously so that popup
 * blockers do not close the Klarna window.
 */
export const MerchantCustomButton: Story = {
    args: {
        showPayButton: false
    },
    render: args => (
        <div>
            {render(args)}
            <button
                type="button"
                onClick={() => {
                    // `addToWindow` in ComponentContainer exposes the element as window.component.
                    (window as unknown as { component?: KlarnaNetwork }).component?.submit();
                }}
            >
                Merchant owned pay button
            </button>
        </div>
    )
};
