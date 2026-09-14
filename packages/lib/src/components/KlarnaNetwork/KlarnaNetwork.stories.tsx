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
    args: {
        // Klarna derives its regional endpoint from the currency, and the test accounts are NA only.
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
