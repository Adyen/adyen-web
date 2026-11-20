import { Fragment, h } from 'preact';
import { useMemo } from 'preact/hooks';
import KlarnaNetwork from './KlarnaNetwork';
import { Checkout } from '../../../storybook/components/Checkout';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { COUNTRY_CODES } from '../../../storybook/constants/countries';
import { handleFinalState } from '../../../storybook/helpers/checkout-handlers';
import { KlarnaCredentialsGate } from './stories/KlarnaCredentialsForm';
import { KlarnaExpressPlayground, useKlarnaExpressLog } from './stories/KlarnaExpressPlayground';
import { createMerchantCallbacks } from './stories/klarna-express-stories-utils';

import type { Meta, StoryObj } from '@storybook/preact-vite';
import type { GlobalStoryProps } from '../../../storybook/types';
import type { ICore } from '../../core/types';
import type { KlarnaCredentials } from './stories/KlarnaCredentialsForm';
import type { KlarnaShippingMode } from './klarna-web-sdk-types';

type Story = StoryObj<GlobalStoryProps>;

type ShippingModeArg = KlarnaShippingMode | 'none';

type ExpressStoryProps = GlobalStoryProps & { shippingMode: ShippingModeArg };

const meta: Meta<GlobalStoryProps> = {
    title: 'Components/KlarnaNetwork',
    parameters: {
        docs: {
            description: {
                component: [
                    'Proof of concept for the Klarna Network Distribution Web SDK.',
                    '',
                    'Enter a Klarna `clientId`, `paymentAccountId` and `partnerAccountId` in the form above the component, then press',
                    'Initialise Klarna. Credentials are never written to the URL or a Storybook build, so they',
                    'have to be re-entered after every reload.',
                    '',
                    'Keep `countryCode` on `US`: Klarna picks its regional endpoint from the currency and the test',
                    'accounts are NA only.',
                    '',
                    'Paying is expected to fail at `/payments`. See KlarnaNetwork.md for the full flow and the',
                    'two changes the backend needs.'
                ].join('\n')
            }
        }
    },
    args: {
        countryCode: COUNTRY_CODES.UnitedStates
    },
    render: checkoutConfig => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => (
                <KlarnaCredentialsGate>
                    {credentials => <ComponentContainer element={new KlarnaNetwork(checkout, credentials)} />}
                </KlarnaCredentialsGate>
            )}
        </Checkout>
    )
};

export default meta;

export const Default: Story = {};

interface KlarnaExpressProps {
    checkout: ICore;
    credentials: KlarnaCredentials;
    shippingMode: ShippingModeArg;
}

function KlarnaExpress({ checkout, credentials, shippingMode }: Readonly<KlarnaExpressProps>) {
    const { entries, log, clear } = useKlarnaExpressLog();

    const element = useMemo(
        () =>
            new KlarnaNetwork(checkout, {
                ...credentials,
                ...(shippingMode !== 'none' && { shippingConfig: { mode: shippingMode } }),
                ...createMerchantCallbacks(log),
                onPaymentCompleted(result, component) {
                    log('onPaymentCompleted', result);
                    if (component) handleFinalState(result, component);
                },
                onPaymentFailed(result, component) {
                    log('onPaymentFailed', result);
                    if (component) handleFinalState(result, component);
                }
            }),
        [checkout, credentials, shippingMode, log]
    );

    return (
        <Fragment>
            <KlarnaExpressPlayground entries={entries} onClear={clear} />
            <ComponentContainer element={element} />
        </Fragment>
    );
}

export const Express: StoryObj<ExpressStoryProps> = {
    args: {
        countryCode: COUNTRY_CODES.UnitedStates,
        // /payments/details runs on the returnUrl page (RedirectResult story) with the redirectResult.
        useSessions: false,
        shippingMode: 'EDITABLE'
    },
    argTypes: {
        shippingMode: {
            control: 'select',
            options: ['EDITABLE', 'READ_ONLY', 'none']
        }
    },
    render: ({ shippingMode, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => (
                <KlarnaCredentialsGate>
                    {credentials => <KlarnaExpress checkout={checkout} credentials={credentials} shippingMode={shippingMode} />}
                </KlarnaCredentialsGate>
            )}
        </Checkout>
    )
};
