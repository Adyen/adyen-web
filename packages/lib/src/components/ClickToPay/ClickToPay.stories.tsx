import { h } from "preact";
import { Checkout } from '../../../storybook/components/Checkout';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import ClickToPay from '.';

import type { MetaConfiguration, StoryConfiguration } from '../../../storybook/types';
import type { ClickToPayConfiguration } from './types';

type ClickToPayStory = StoryConfiguration<ClickToPayConfiguration>;

const meta: MetaConfiguration<ClickToPayConfiguration> = {
    title: 'Components/ClickToPay'
};

export const StandaloneComponent: ClickToPayStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => {
                return <ComponentContainer element={new ClickToPay(checkout, componentConfiguration)} />;
            }}
        </Checkout>
    ),
    args: {
        componentConfiguration: {
            shopperEmail: new URLSearchParams(document.location.search).get('shopperEmail') || 'gui.ctp@adyen.com',
            merchantDisplayName: 'Adyen Merchant Name',
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
