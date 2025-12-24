import { h } from 'preact';
import { http, HttpResponse } from 'msw';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import MBWay from './MBWay';
import { AwaitConfiguration } from '../types';

type MBWayStory = StoryConfiguration<AwaitConfiguration>;

const meta: MetaConfiguration<AwaitConfiguration> = {
    title: 'Components/MBWay'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<AwaitConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new MBWay(checkout, componentConfiguration)} />}</Checkout>
);

export const Default: MBWayStory = {
    render,
    args: {
        countryCode: 'PT'
    }
};

const createMBWayMockHandlers = () => [
    http.post('https://checkoutshopper-test.adyen.com/checkoutshopper/services/PaymentInitiation/v1/status', () => {
        return HttpResponse.json({
            payload: '',
            resultCode: 'pending',
            type: 'pending'
        });
    })
];

export const AwaitScreen: MBWayStory = {
    args: {
        countryCode: 'PT'
    },
    parameters: {
        msw: {
            handlers: createMBWayMockHandlers()
        }
    },
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => (
                <ComponentContainer
                    element={
                        new MBWay(checkout, {
                            paymentData: 'Ab02b4c0....J86s=',
                            ...componentConfiguration
                        })
                    }
                />
            )}
        </Checkout>
    )
};

export default meta;
