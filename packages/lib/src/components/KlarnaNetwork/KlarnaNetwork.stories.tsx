import { h } from 'preact';
import KlarnaNetwork from './KlarnaNetwork';
import { Checkout } from '../../../storybook/components/Checkout';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { COUNTRY_CODES } from '../../../storybook/constants/countries';
import { KlarnaCredentialsGate } from './stories/KlarnaCredentialsForm';

import type { Meta, StoryObj } from '@storybook/preact-vite';
import type { GlobalStoryProps } from '../../../storybook/types';
import type { KlarnaAuthorizationFlow } from './types';

type KlarnaNetworkStoryProps = GlobalStoryProps & {
    authorizationFlow: KlarnaAuthorizationFlow;
};

type Story = StoryObj<KlarnaNetworkStoryProps>;

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
                    'history or a Storybook build, so they have to be re-entered after every reload.',
                    '',
                    'Klarna picks its regional endpoint from the currency, so keep `countryCode` on `US`: the test',
                    'accounts are NA only and EUR answers `404 RESOURCE_NOT_FOUND` on `/eu`.',
                    '',
                    'The two stories below are the two integration models Klarna documents for the same',
                    '`klarna_network` tx variant. `authorizationFlow` selects between them.'
                ].join('\n')
            }
        }
    },
    argTypes: {
        authorizationFlow: {
            control: 'select',
            options: ['redirect', 'sdk'] satisfies KlarnaAuthorizationFlow[]
        }
    },
    args: {
        // Klarna derives its regional endpoint from the currency, and the test accounts are NA only.
        countryCode: COUNTRY_CODES.UnitedStates,
        authorizationFlow: 'redirect'
    },
    render: ({ authorizationFlow, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => (
                <KlarnaCredentialsGate>
                    {credentials => <ComponentContainer element={new KlarnaNetwork(checkout, { ...credentials, authorizationFlow })} />}
                </KlarnaCredentialsGate>
            )}
        </Checkout>
    )
};

export default meta;

/**
 * Klarna's server-side model, which Adyen has shipped. Completes a real payment end to end: the Web
 * SDK renders the presentation, `/payments` answers `RedirectShopper`, and the shopper finishes on
 * Klarna's hosted page before Adyen finalises the authorization from a webhook.
 */
export const RedirectFlow: Story = {
    args: { authorizationFlow: 'redirect' }
};

/**
 * Klarna's "hosted checkout pages and embedded elements" model, where the purchase journey runs in
 * context. This is the target integration and it is expected to fail today: `/payments` rejects
 * `klarnaNetworkSessionToken` and `paymentOptionId` with `400 errorCode 702`, and answers with the
 * redirect flow instead of an unwrapped Klarna `payment_request_url`.
 *
 * The component reports exactly that rather than handing Klarna a URL it cannot read. See the
 * `KlarnaNetwork` class JSDoc for the three changes `/payments` needs.
 */
export const SdkFlow: Story = {
    args: { authorizationFlow: 'sdk' }
};
