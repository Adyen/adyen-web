import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import { TxVariants } from '../tx-variants';
import { KlarnaNetworkContainer } from './components/KlarnaNetworkContainer/KlarnaNetworkContainer';
import { mapKlarnaAddressToAdyen, mapKlarnaShippingOptionToAdyen, mapShippingUpdateToKlarna } from './utils/klarna-mappers';

import type { RawPaymentResponse } from '../../types/global-types';
import type { KlarnaNetworkConfiguration, KlarnaNetworkShippingUpdate } from './types';
import type {
    KlarnaInitiateParams,
    KlarnaPaymentError,
    KlarnaShippingAddress,
    KlarnaShippingOption,
    KlarnaShippingRejection,
    KlarnaShippingUpdatePayload
} from './klarna-web-sdk-types';
import type { KlarnaNetworkAuthorizeResult } from './components/KlarnaNetworkContainer/KlarnaNetworkContainer';

const DEFAULT_ADDRESS_REJECTION = 'UNSUPPORTED_SHIPPING_ADDRESS';
const DEFAULT_OPTION_REJECTION = 'UNSUPPORTED_SHIPPING_OPTION';

class KlarnaNetwork extends UIElement<KlarnaNetworkConfiguration> {
    public static readonly type = TxVariants.klarna_network;

    private klarnaNetworkSessionToken?: string;

    public override get isValid(): boolean {
        return true;
    }

    public override get displayName(): string {
        const name = super.displayName;
        return name === (KlarnaNetwork.type as string) ? 'Klarna' : name;
    }

    protected formatData() {
        return {
            paymentMethod: {
                type: KlarnaNetwork.type,
                klarnaNetworkSessionToken: this.klarnaNetworkSessionToken,
                klarnaNetworkPaymentAccountId: this.props.paymentAccountId
            }
        };
    }

    private readonly authorize = async ({ klarnaNetworkSessionToken }: KlarnaInitiateParams): Promise<KlarnaNetworkAuthorizeResult> => {
        this.klarnaNetworkSessionToken = klarnaNetworkSessionToken;

        const response = (await this.makePaymentsCall()) as RawPaymentResponse;

        this.setElementStatus('ready');

        const paymentRequestUrl = response.action?.sdkData?.paymentRequestUrl ?? response.action?.url;

        return { paymentRequestUrl };
    };

    private readonly handleKlarnaShippingAddressChange = async (
        _paymentRequest: unknown,
        address: KlarnaShippingAddress
    ): Promise<KlarnaShippingUpdatePayload | KlarnaShippingRejection> => {
        const { onShippingAddressChange } = this.props;
        if (!onShippingAddressChange) return { rejectionReason: DEFAULT_ADDRESS_REJECTION };

        try {
            const update = await new Promise<KlarnaNetworkShippingUpdate>((resolve, reject) =>
                onShippingAddressChange({ shippingAddress: mapKlarnaAddressToAdyen(address) }, { resolve, reject }, this)
            );
            return mapShippingUpdateToKlarna(update);
        } catch (reason: unknown) {
            return { rejectionReason: typeof reason === 'string' && reason ? reason : DEFAULT_ADDRESS_REJECTION };
        }
    };

    private readonly handleKlarnaShippingOptionSelect = async (
        _paymentRequest: unknown,
        option: KlarnaShippingOption
    ): Promise<KlarnaShippingUpdatePayload | KlarnaShippingRejection> => {
        const { onShippingOptionSelected } = this.props;
        if (!onShippingOptionSelected) return { rejectionReason: DEFAULT_OPTION_REJECTION };

        try {
            const currency = this.props.amount?.currency ?? '';
            const update = await new Promise<Omit<KlarnaNetworkShippingUpdate, 'deliveryMethods'>>((resolve, reject) =>
                onShippingOptionSelected({ selectedDeliveryMethod: mapKlarnaShippingOptionToAdyen(option, currency) }, { resolve, reject }, this)
            );
            return mapShippingUpdateToKlarna(update);
        } catch (reason: unknown) {
            return { rejectionReason: typeof reason === 'string' && reason ? reason : DEFAULT_OPTION_REJECTION };
        }
    };

    private readonly handleKlarnaError = (error: KlarnaPaymentError | Error, paymentRequest?: unknown): void => {
        const { errorCode, errorMessage } = error as KlarnaPaymentError;
        console.error('Adyen Web Catch wrapper for Klarna SDK error', { errorCode, errorMessage, error, paymentRequest });
        this.setElementStatus('ready');
    };

    protected override componentToRender(): h.JSX.Element {
        const { onShippingAddressChange, onShippingOptionSelected, ...rest } = this.props;

        return (
            <KlarnaNetworkContainer
                {...rest}
                onAuthorize={this.authorize}
                onError={this.handleError}
                onKlarnaError={this.handleKlarnaError}
                {...(onShippingAddressChange && { onShippingAddressChange: this.handleKlarnaShippingAddressChange })}
                {...(onShippingOptionSelected && { onShippingOptionSelect: this.handleKlarnaShippingOptionSelect })}
            />
        );
    }
}

export default KlarnaNetwork;
