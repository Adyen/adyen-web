import { h } from 'preact';
import { Meta, StoryObj } from '@storybook/preact';
import { PaymentMethodStoryProps } from '../../../../storybook/types';
import { GiftCardConfiguration } from '../types';
import { GiftcardExample } from './GiftcardExample';
import { http, HttpResponse } from 'msw';

type GifcardStory = StoryObj<PaymentMethodStoryProps<GiftCardConfiguration>>;

const meta: Meta<PaymentMethodStoryProps<GiftCardConfiguration>> = {
    title: 'Components/Partial Payments/Givex(Giftcard)'
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
    args: baseArgs,
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
