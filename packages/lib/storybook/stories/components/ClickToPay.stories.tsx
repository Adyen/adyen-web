import React from 'react';
import { Checkout } from '../Checkout';
import { ComponentContainer } from '../ComponentContainer';
import ClickToPay from '../../../src/components/ClickToPay';

import type { MetaConfiguration, StoryConfiguration } from '../types';
import type { ClickToPayConfiguration } from '../../../src/components/ClickToPay/types';

type ClickToPayStory = StoryConfiguration<ClickToPayConfiguration>;

const meta: MetaConfiguration<ClickToPayConfiguration> = {
    title: 'Components/ClickToPay'
};

export const StandaloneComponent: ClickToPayStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => {
                const shopperEmail = new URLSearchParams(document.location.search).get('shopperEmail');
                return (
                    <ComponentContainer element={new ClickToPay(checkout, { ...componentConfiguration, ...(shopperEmail && { shopperEmail }) })} />
                );
            }}
        </Checkout>
    ),
    args: {
        componentConfiguration: {
            shopperEmail: 'gui.ctp@adyen.com',
            merchantDisplayName: 'Adyen Merchant Name',
            onChange(state, component) {
                console.log(state, component);
            },
            configuration: {
                visaSrciDpaId: '8e6e347c-254e-863f-0e6a-196bf2d9df02',
                visaSrcInitiatorId: 'B9SECVKIQX2SOBQ6J9X721dVBBKHhJJl1nxxVbemHGn5oB6S8',
                mcDpaId: '6d41d4d6-45b1-42c3-a5d0-a28c0e69d4b1_dpa2',
                mcSrcClientId: '6d41d4d6-45b1-42c3-a5d0-a28c0e69d4b1'
            }
        }
    }
};

export default meta;
