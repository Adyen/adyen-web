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

type Story = StoryObj<GlobalStoryProps>;

const meta: Meta<GlobalStoryProps> = {
    title: 'Drop-in/Drop-in with Klarna Network',
    tags: ['no-automated-visual-test'],
    args: {
        // Klarna derives its regional endpoint from the currency, and the test accounts are NA only.
        countryCode: COUNTRY_CODES.UnitedStates,
        // 'klarna_network' is a synthetic tx variant that /paymentMethods never returns, and Drop-in
        // only creates elements for entries present in the response.
        paymentMethodsOverride: {
            paymentMethods: [
                { name: 'Credit Card', type: 'scheme' },
                { name: 'Klarna', type: TxVariants.klarna_network }
            ]
        }
    },
    render: checkoutConfig => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => (
                <KlarnaCredentialsGate>
                    {credentials => {
                        const dropinConfiguration: DropinConfiguration = {
                            paymentMethodComponents: [KlarnaNetwork, Card],
                            // getComponentConfiguration() keys off the raw tx variant.
                            paymentMethodsConfiguration: {
                                [TxVariants.klarna_network]: credentials
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

export const Default: Story = {};
