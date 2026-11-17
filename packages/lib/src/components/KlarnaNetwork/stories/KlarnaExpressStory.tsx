import { Fragment, h } from 'preact';
import { useMemo } from 'preact/hooks';
import { Checkout } from '../../../../storybook/components/Checkout';
import { ComponentContainer } from '../../../../storybook/components/ComponentContainer';
import { handleFinalState } from '../../../../storybook/helpers/checkout-handlers';
import { KlarnaCredentialsGate } from './KlarnaCredentialsForm';
import { KlarnaExpressPlayground, useKlarnaExpressLog } from './KlarnaExpressPlayground';
import { SUPPORTED_SHIPPING_COUNTRY, createMerchantCallbacks } from './klarna-express-stories-utils';

import type { StoryObj } from '@storybook/preact-vite';
import type { GlobalStoryProps } from '../../../../storybook/types';
import type { ICore } from '../../../core/types';
import type { KlarnaCredentials } from './KlarnaCredentialsForm';
import type { KlarnaShippingMode } from '../klarna-web-sdk-types';
import type KlarnaNetworkExpress from '../KlarnaNetworkExpress';

export type ShippingModeArg = KlarnaShippingMode | 'none';

export type ExpressStoryProps = GlobalStoryProps & { shippingMode: ShippingModeArg };

type ExpressElementClass = typeof KlarnaNetworkExpress;

export const EXPRESS_STORY_ARGS: StoryObj<ExpressStoryProps>['args'] = {
    // Klarna sends the shopper to returnUrl without a redirectResult; the result comes from the Adyen notification.
    useSessions: false,
    shippingMode: 'EDITABLE'
};

export const EXPRESS_STORY_ARG_TYPES: StoryObj<ExpressStoryProps>['argTypes'] = {
    shippingMode: {
        control: 'select',
        options: ['EDITABLE', 'READ_ONLY', 'none']
    }
};

interface KlarnaExpressDemoProps {
    ElementClass: ExpressElementClass;
    checkout: ICore;
    credentials: KlarnaCredentials;
    shippingMode: ShippingModeArg;
}

function KlarnaExpressDemo({ ElementClass, checkout, credentials, shippingMode }: Readonly<KlarnaExpressDemoProps>) {
    const { entries, log, clear } = useKlarnaExpressLog();

    const element = useMemo(
        () =>
            new ElementClass(checkout, {
                ...credentials,
                ...(shippingMode !== 'none' && { shippingConfig: { mode: shippingMode, supportedCountries: [SUPPORTED_SHIPPING_COUNTRY] } }),
                ...createMerchantCallbacks(log),
                onPaymentCompleted(result, component) {
                    log('onPaymentCompleted', result);
                    if (component) handleFinalState(result, component);
                },
                onPaymentFailed(result, component) {
                    log('onPaymentFailed', result);
                    if (component) handleFinalState(result, component);
                }
            }),
        [ElementClass, checkout, credentials, shippingMode, log]
    );

    return (
        <Fragment>
            <KlarnaExpressPlayground entries={entries} onClear={clear} />
            <ComponentContainer element={element} />
        </Fragment>
    );
}

export function renderKlarnaExpressStory(ElementClass: ExpressElementClass): StoryObj<ExpressStoryProps>['render'] {
    return function RenderKlarnaExpressStory({ shippingMode, ...checkoutConfig }) {
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
                            />
                        )}
                    </KlarnaCredentialsGate>
                )}
            </Checkout>
        );
    };
}
