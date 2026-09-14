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
    parameters: {
        docs: {
            description: {
                component: [
                    'Drop-in renders Klarna Network from the real /paymentMethods response, which returns',
                    "`{ name: 'Pay with Klarna', type: 'klarna_network' }`, so no paymentMethodsOverride is needed.",
                    '',
                    'See KlarnaNetwork.md for the flow and the current backend limitation.'
                ].join('\n')
            }
        }
    },
    args: {
        // Klarna derives its regional endpoint from the currency, and the test accounts are NA only.
        countryCode: COUNTRY_CODES.UnitedStates
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
