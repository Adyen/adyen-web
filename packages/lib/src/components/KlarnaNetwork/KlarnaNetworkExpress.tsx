import { h } from 'preact';
import KlarnaNetwork from './KlarnaNetwork';
import { KlarnaExpressPresentationContainer } from './components/KlarnaExpressPresentationContainer/KlarnaExpressPresentationContainer';
import { mapKlarnaAddressToAdyen, mapKlarnaShippingOptionToAdyen, mapShippingUpdateToKlarna } from './utils/klarna-mappers';

import type { KlarnaNetworkExpressConfiguration, KlarnaNetworkShippingUpdate } from './types';
import type {
    KlarnaSelectedShippingOption,
    KlarnaShippingAddress,
    KlarnaShippingRejection,
    KlarnaShippingUpdatePayload
} from './klarna-web-sdk-types';

const DEFAULT_ADDRESS_REJECTION = 'ADDRESS_NOT_SUPPORTED';
const DEFAULT_OPTION_REJECTION = 'INVALID_OPTION';

/**
 * Express Checkout with editable shipping. The button comes from Payment.presentation().
 * Adds the shipping handlers on top of KlarnaNetwork; /payments and formatData are inherited.
 */
class KlarnaNetworkExpress extends KlarnaNetwork<KlarnaNetworkExpressConfiguration> {
    protected readonly handleKlarnaShippingAddressChange = async (
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

    protected readonly handleKlarnaShippingOptionSelect = async (
        _paymentRequest: unknown,
        option: KlarnaSelectedShippingOption
    ): Promise<KlarnaShippingUpdatePayload | KlarnaShippingRejection> => {
        const { onShippingOptionSelected } = this.props;
        if (!onShippingOptionSelected) return { rejectionReason: DEFAULT_OPTION_REJECTION };

        try {
            const update = await new Promise<Omit<KlarnaNetworkShippingUpdate, 'deliveryMethods'>>((resolve, reject) =>
                onShippingOptionSelected({ selectedDeliveryMethod: mapKlarnaShippingOptionToAdyen(option) }, { resolve, reject }, this)
            );
            return mapShippingUpdateToKlarna(update);
        } catch (reason: unknown) {
            return { rejectionReason: typeof reason === 'string' && reason ? reason : DEFAULT_OPTION_REJECTION };
        }
    };

    protected override componentToRender(): h.JSX.Element {
        const { clientId, partnerAccountId, paymentAccountId, shippingConfig } = this.props;

        return (
            <KlarnaExpressPresentationContainer
                clientId={clientId}
                partnerAccountId={partnerAccountId}
                paymentAccountId={paymentAccountId}
                shippingConfig={shippingConfig}
                onAuthorize={this.authorize}
                onError={this.handleError}
                onKlarnaError={this.handleKlarnaError}
                onShippingAddressChange={this.handleKlarnaShippingAddressChange}
                onShippingOptionSelect={this.handleKlarnaShippingOptionSelect}
            />
        );
    }
}

export default KlarnaNetworkExpress;
