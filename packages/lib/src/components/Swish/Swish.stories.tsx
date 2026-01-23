import { h } from 'preact';
import { http, HttpResponse } from 'msw';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../storybook/types';
import { QRLoaderConfiguration } from '../../types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import Swish from './Swish';

type SwishStory = StoryConfiguration<QRLoaderConfiguration>;

const meta: MetaConfiguration<QRLoaderConfiguration> = {
    title: 'Components/Swish'
};

const createSwishMockHandlers = () => [
    http.post('https://checkoutshopper-test.adyen.com/checkoutshopper/services/PaymentInitiation/v1/status', () => {
        return HttpResponse.json({
            payload: '',
            resultCode: 'pending',
            type: 'pending'
        });
    })
];

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<QRLoaderConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new Swish(checkout, componentConfiguration)} />}</Checkout>
);

export const Default: SwishStory = {
    render,
    args: {
        countryCode: 'SE'
    }
};

export const QRCodeScreen: SwishStory = {
    args: {
        countryCode: 'SE'
    },
    parameters: {
        msw: {
            handlers: createSwishMockHandlers()
        }
    },
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => (
                <ComponentContainer
                    element={
                        new Swish(checkout, {
                            paymentData: 'Ab02b4c0....J86s=',
                            qrCodeData: 'testqrcode',
                            ...componentConfiguration
                        })
                    }
                />
            )}
        </Checkout>
    )
};

export default meta;
