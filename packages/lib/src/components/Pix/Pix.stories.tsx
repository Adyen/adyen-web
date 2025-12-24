import { h } from 'preact';
import { http, HttpResponse } from 'msw';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../storybook/types';
import { PixConfiguration } from './types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import Pix from './Pix';

type PixStory = StoryConfiguration<PixConfiguration>;

const meta: MetaConfiguration<PixConfiguration> = {
    title: 'Components/Pix'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<PixConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new Pix(checkout, componentConfiguration)} />}</Checkout>
);

export const Default: PixStory = {
    render,
    args: {
        countryCode: 'BR'
    }
};

export const WithPersonalDetails: PixStory = {
    render,
    args: {
        countryCode: 'BR',
        componentConfiguration: {
            personalDetailsRequired: true
        }
    }
};

const createPixMockHandlers = () => [
    http.post('https://checkoutshopper-test.adyen.com/checkoutshopper/services/PaymentInitiation/v1/status', () => {
        return HttpResponse.json({
            payload: '',
            resultCode: 'pending',
            type: 'pending'
        });
    })
];

export const QRCodeScreen: PixStory = {
    args: {
        countryCode: 'BR'
    },
    parameters: {
        msw: {
            handlers: createPixMockHandlers()
        }
    },
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => (
                <ComponentContainer
                    element={
                        new Pix(checkout, {
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
