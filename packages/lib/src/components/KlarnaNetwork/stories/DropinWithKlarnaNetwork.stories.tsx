import { h } from 'preact';
import Card from '../../Card';
import DropinComponent from '../../Dropin/Dropin';
import KlarnaNetwork from '../KlarnaNetwork';
import { Checkout } from '../../../../storybook/components/Checkout';
import { ComponentContainer } from '../../../../storybook/components/ComponentContainer';
import { COUNTRY_CODES } from '../../../../storybook/constants/countries';
import { TxVariants } from '../../tx-variants';
import { KlarnaCredentialsGate } from './KlarnaCredentialsForm';

import type { Meta, StoryObj } from '@storybook/preact-vite';
import type { GlobalStoryProps } from '../../../../storybook/types';
import type { DropinConfiguration } from '../../Dropin/types';
import type { KlarnaNetworkConfiguration, KlarnaPayButtonVariant } from '../types';

/**
 * `klarna_network` is a synthetic tx variant that /paymentMethods never returns, and Drop-in only
 * creates elements for entries present in the response. Overriding the response is therefore the
 * only way to make the row appear, and it also forces the advanced flow in `create-checkout.ts`.
 */
type DropinKlarnaNetworkStoryProps = GlobalStoryProps & {
    sendKlarnaNetworkData: boolean;
    payButtonVariant: KlarnaPayButtonVariant;
};

type Story = StoryObj<DropinKlarnaNetworkStoryProps>;

const meta: Meta<DropinKlarnaNetworkStoryProps> = {
    title: 'Drop-in/Drop-in with Klarna Network',
    tags: ['no-automated-visual-test'],
    parameters: {
        docs: {
            description: {
                component: [
                    'Drop-in rendering the Klarna Network proof of concept as an accordion item.',
                    '',
                    'Paste a Klarna `clientId` into the form above Drop-in and press Initialise Klarna. The form is',
                    'used instead of the controls panel so that credentials never reach the URL, browser history or a',
                    'Storybook build, and nothing is seeded from the environment, so they have to be re-entered after',
                    'every reload. Keep `countryCode` on `US`: the test accounts are NA only.',
                    '',
                    'The component submits the intended Klarna Network contract by default:',
                    '`type: klarna_network` plus `klarnaNetworkSessionToken` and `paymentOptionId`. Adyen\u2019s',
                    '`/payments` supports none of it yet, and rejects the two fields with `400 errorCode 702`, so',
                    'this story turns `sendKlarnaNetworkData` off. Watch the console for the captured values and',
                    'the raw response.',
                    '',
                    "Klarna's presentation API also answers `401 PERMISSION_DENIED` for Adyen's acquiring",
                    '`clientId`, and the SDK hides that behind a hardcoded fallback presentation, so the row renders',
                    'with no Klarna session behind it. The component warns on the console when it detects this.',
                    '',
                    'A plain merchant `clientId`, with both account id fields left empty, does get a real presentation',
                    'from the same origin, so the domain is allowlisted and the 401 is a missing entitlement on the',
                    'acquiring credential alone.',
                    '',
                    'Paying cannot complete either: Klarna rejects the Adyen-hosted redirect URL with "Invalid',
                    'paymentRequestUrl: cannot extract access token or region". Klarna needs a payment request URL',
                    'minted by its own Payment Request API.'
                ].join('\n')
            }
        }
    },
    argTypes: {
        sendKlarnaNetworkData: { control: 'boolean' },
        payButtonVariant: {
            control: 'select',
            options: ['klarna', 'adyen'] satisfies KlarnaPayButtonVariant[]
        }
    },
    args: {
        // Klarna derives its regional endpoint from the currency, and the test accounts behind these
        // credentials are NA only: EUR answers 404 RESOURCE_NOT_FOUND on /eu, USD reaches /na.
        countryCode: COUNTRY_CODES.UnitedStates,
        sendKlarnaNetworkData: false,
        payButtonVariant: 'klarna',
        paymentMethodsOverride: {
            paymentMethods: [
                { name: 'Credit Card', type: 'scheme' },
                { name: 'Klarna', type: TxVariants.klarna_network },
                { name: 'iDEAL', type: 'ideal' }
            ]
        }
    },
    render: ({ sendKlarnaNetworkData, payButtonVariant, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => (
                <KlarnaCredentialsGate>
                    {credentials => {
                        const klarnaNetworkConfiguration: KlarnaNetworkConfiguration = {
                            ...credentials,
                            sendKlarnaNetworkData,
                            payButtonVariant
                        };

                        const dropinConfiguration: DropinConfiguration = {
                            paymentMethodComponents: [KlarnaNetwork, Card],
                            // getComponentConfiguration() keys off the raw tx variant, so the key is 'klarna_network'.
                            paymentMethodsConfiguration: {
                                [TxVariants.klarna_network]: klarnaNetworkConfiguration
                            }
                        };

                        return <ComponentContainer element={new DropinComponent(checkout, dropinConfiguration)} />;
                    }}
                </KlarnaCredentialsGate>
            )}
        </Checkout>
    )
};

export default meta;

/** Klarna's own pay button inside the Drop-in accordion item. */
export const KlarnaNativeButton: Story = {
    args: {
        payButtonVariant: 'klarna'
    }
};

/** The standard Adyen PayButton inside the Drop-in accordion item. */
export const AdyenPayButton: Story = {
    args: {
        payButtonVariant: 'adyen'
    }
};
