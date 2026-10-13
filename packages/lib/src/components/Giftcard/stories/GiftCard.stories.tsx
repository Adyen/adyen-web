import { h } from 'preact';
import { Meta, StoryObj } from '@storybook/preact-vite';
import { PaymentMethodStoryProps } from '../../../../storybook/types';
import { GiftCardConfiguration } from '../types';
import { GiftcardExample } from './GiftcardExample';
import { http, HttpResponse } from 'msw';

type GifcardStory = StoryObj<PaymentMethodStoryProps<GiftCardConfiguration>>;

const meta: Meta<PaymentMethodStoryProps<GiftCardConfiguration>> = {
    title: 'Components/Gift Cards'
};

// Base story args
const baseArgs = {
    countryCode: 'NL',
    useSessions: true,
    srConfig: { showPanel: false, moveFocus: true },
    componentConfiguration: {
        brand: 'givex'
    }
};

export const Default: GifcardStory = {
    render: args => {
        return <GiftcardExample contextArgs={args} />;
    },
    args: baseArgs
};

export const WithGiftcard: GifcardStory = {
    render: args => {
        return <GiftcardExample contextArgs={args} renderCard={false} />;
    },
    args: baseArgs
};

export const WithBrandPlaceholders: GifcardStory = {
    render: args => {
        return <GiftcardExample contextArgs={args} />;
    },
    args: {
        ...baseArgs,
        componentConfiguration: {
            brand: 'givex',
            placeholders: { cardNumber: '2207 8500 1234 5678 0000 1', securityCode: '1234' },
            brandsConfiguration: {
                givex: { placeholders: { cardNumber: '6006 4912 3456 7890 1234 5', securityCode: '1234' } }
            }
        }
    },
};

export const NoBalanceError: GifcardStory = {
    render: args => {
        return <GiftcardExample contextArgs={args} />;
    },
    args: baseArgs,
    parameters: {
        msw: {
            handlers: [
                http.post('*/sessions/*/paymentMethodBalance', () => {
                    console.log('MSW: No balance error');
                    return HttpResponse.json({
                        balance: { value: 0, currency: 'EUR' }
                    });
                })
            ]
        }
    }
};

export const CardError: GifcardStory = {
    render: args => {
        return <GiftcardExample contextArgs={args} />;
    },
    args: baseArgs,
    parameters: {
        msw: {
            handlers: [
                http.post('*/sessions/*/paymentMethodBalance', () => {
                    console.log('MSW: Card error - no balance returned');
                    return HttpResponse.json({});
                })
            ]
        }
    }
};

export const CurrencyError: GifcardStory = {
    render: args => {
        return <GiftcardExample contextArgs={args} />;
    },
    args: baseArgs,
    parameters: {
        msw: {
            handlers: [
                http.post('*/sessions/*/paymentMethodBalance', () => {
                    console.log('MSW: Currency error - different currency');
                    return HttpResponse.json({
                        balance: { value: 1000, currency: 'USD' }
                    });
                })
            ]
        }
    }
};

export default meta;
