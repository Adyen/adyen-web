import KlarnaNetworkExpress from './KlarnaNetworkExpress';
import { COUNTRY_CODES } from '../../../storybook/constants/countries';
import { EXPRESS_STORY_ARGS, EXPRESS_STORY_ARG_TYPES, renderKlarnaExpressStory } from './stories/KlarnaExpressStory';

import type { Meta, StoryObj } from '@storybook/preact-vite';
import type { ExpressStoryProps } from './stories/KlarnaExpressStory';

const meta: Meta<ExpressStoryProps> = {
    title: 'Components/KlarnaNetwork/Express Presentation',
    parameters: {
        docs: {
            description: {
                component: [
                    'Express Checkout with editable shipping (`KlarnaNetworkExpress` + `KlarnaExpressPresentationContainer`).',
                    'The button and the on-site message come from `Payment.presentation()`.',
                    '',
                    'After `/payments`, `initiate` returns `{ paymentRequestId, shippingConfig }`, and the shipping events',
                    'from Klarna reach the merchant callbacks. Every step shows up in the event log.',
                    '',
                    'See KlarnaNetwork-Express-Checkout-TDD.md for the full flow and what the backend needs.'
                ].join('\n')
            }
        }
    },
    args: {
        countryCode: COUNTRY_CODES.UnitedStates,
        ...EXPRESS_STORY_ARGS
    },
    argTypes: EXPRESS_STORY_ARG_TYPES,
    render: renderKlarnaExpressStory(KlarnaNetworkExpress)
};

export default meta;

export const Default: StoryObj<ExpressStoryProps> = {};
