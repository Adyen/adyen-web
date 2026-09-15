import { h } from 'preact';
import KlarnaNetwork from './KlarnaNetwork';
import { Checkout } from '../../../storybook/components/Checkout';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { COUNTRY_CODES } from '../../../storybook/constants/countries';
import { KlarnaCredentialsGate } from './stories/KlarnaCredentialsForm';

import type { Meta, StoryObj } from '@storybook/preact-vite';
import type { GlobalStoryProps } from '../../../storybook/types';

type Story = StoryObj<GlobalStoryProps>;

const meta: Meta<GlobalStoryProps> = {
    title: 'Components/KlarnaNetwork',
    parameters: {
        docs: {
            description: {
                component: [
                    'Proof of concept for the Klarna Network Distribution Web SDK.',
                    '',
                    'Enter a Klarna `clientId` and `paymentAccountId` in the form above the component, then press',
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
