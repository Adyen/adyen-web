import { h } from 'preact';
import { useMemo } from 'preact/hooks';
import { Checkout } from '../../../../storybook/components/Checkout';
import { ComponentContainer } from '../../../../storybook/components/ComponentContainer';
import { handleFinalState } from '../../../../storybook/helpers/checkout-handlers';
import { KlarnaCredentialsGate } from './KlarnaCredentialsForm';
import { ON_SHIPPING_ADDRESS_CHANGE_DATA, createShippingCallbacks, logKlarnaEvent } from './klarna-express-stories-utils';
import type { OnShippingAddressChangeData } from './klarna-express-stories-utils';

import type { StoryObj } from '@storybook/preact-vite';
import type { GlobalStoryProps } from '../../../../storybook/types';
import type { ICore } from '../../../core/types';
import type { KlarnaCredentials } from './KlarnaCredentialsForm';
import type { KlarnaShippingMode } from '../klarna-web-sdk-types';
import type KlarnaNetworkExpress from '../KlarnaNetworkExpress';

export type ShippingModeArg = KlarnaShippingMode | 'none';

export type ExpressStoryProps = GlobalStoryProps & { shippingMode: ShippingModeArg; onShippingAddressChangeData: OnShippingAddressChangeData };

type ExpressElementClass = typeof KlarnaNetworkExpress;

export const EXPRESS_STORY_ARGS: StoryObj<ExpressStoryProps>['args'] = {
    // Klarna sends the shopper to returnUrl without a redirectResult; the result comes from the Adyen notification.
    useSessions: false,
    shippingMode: 'EDITABLE',
    // Only feeds the shipping callbacks; the /payments amount still comes from the `amount` control
    onShippingAddressChangeData: ON_SHIPPING_ADDRESS_CHANGE_DATA
};

export const EXPRESS_STORY_ARG_TYPES: StoryObj<ExpressStoryProps>['argTypes'] = {
    shippingMode: {
        control: 'select',
        options: ['EDITABLE', 'READ_ONLY', 'none']
    },
    onShippingAddressChangeData: {
        control: 'object',
        description: 'Cart and shipping options the shipping callbacks send to Klarna'
    }
};

interface KlarnaExpressDemoProps {
    ElementClass: ExpressElementClass;
    checkout: ICore;
    credentials: KlarnaCredentials;
    shippingMode: ShippingModeArg;
    onShippingAddressChangeData: OnShippingAddressChangeData;
}

function KlarnaExpressDemo({ ElementClass, checkout, credentials, shippingMode, onShippingAddressChangeData }: Readonly<KlarnaExpressDemoProps>) {
    const element = useMemo(
        () =>
            new ElementClass(checkout, {
                ...credentials,
                ...(shippingMode !== 'none' && {
                    shippingConfig: { mode: shippingMode, supportedCountries: [onShippingAddressChangeData.shipsToCountry] }
                }),
                ...createShippingCallbacks(onShippingAddressChangeData),
                onPaymentCompleted(result, component) {
                    logKlarnaEvent('onPaymentCompleted', result);
                    if (component) handleFinalState(result, component);
                },
                onPaymentFailed(result, component) {
                    logKlarnaEvent('onPaymentFailed', result);
                    if (component) handleFinalState(result, component);
                }
            }),
        [ElementClass, checkout, credentials, shippingMode, onShippingAddressChangeData]
    );

    return <ComponentContainer element={element} />;
}

export function renderKlarnaExpressStory(ElementClass: ExpressElementClass): StoryObj<ExpressStoryProps>['render'] {
    return function RenderKlarnaExpressStory({ shippingMode, onShippingAddressChangeData, ...checkoutConfig }) {
        return (
            <Checkout checkoutConfig={checkoutConfig}>
                {checkout => (
                    <KlarnaCredentialsGate>
                        {credentials => (
                            <KlarnaExpressDemo
                                ElementClass={ElementClass}
                                checkout={checkout}
                                credentials={credentials}
                                shippingMode={shippingMode}
                                onShippingAddressChangeData={onShippingAddressChangeData}
                            />
                        )}
                    </KlarnaCredentialsGate>
                )}
            </Checkout>
        );
    };
}
