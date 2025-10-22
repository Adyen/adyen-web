import { UIElementStatus } from './types';
import { RawPaymentResponse, PaymentResponseData, Order } from '../../../types/global-types';
import { IDropin } from '../../Dropin/types';

const ALLOWED_PROPERTIES = ['action', 'resultCode', 'sessionData', 'order', 'sessionResult', 'donationToken', 'error'];

export function sanitizeResponse(response: RawPaymentResponse): PaymentResponseData {
    const removedProperties = [];

    const sanitizedObject = Object.keys(response).reduce((acc, cur) => {
        if (!ALLOWED_PROPERTIES.includes(cur)) {
            removedProperties.push(cur);
        } else {
            acc[cur] = response[cur];
        }
        return acc;
    }, {});

    if (removedProperties.length) console.warn(`The following properties should not be passed to the client: ${removedProperties.join(', ')}`);

    return sanitizedObject as PaymentResponseData;
}

/**
 * Remove not relevant properties in the final payment result object
 *
 * @param paymentResponse
 */
export function cleanupFinalResult(paymentResponse?: PaymentResponseData): void {
    if (!paymentResponse) return;

    delete paymentResponse.order;
    delete paymentResponse.action;
    if (!paymentResponse.donationToken || paymentResponse.donationToken.length === 0) {
        delete paymentResponse.donationToken;
    }
}

export function resolveFinalResult(result: PaymentResponseData): [status: UIElementStatus, statusProps?: any] {
    switch (result.resultCode) {
        case 'Authorised':
        case 'Received':
            return ['success'];
        case 'Pending':
            return ['success'];
        case 'Cancelled':
        case 'Error':
        case 'Refused':
            return ['error'];
        default:
    }
}

export function verifyPaymentDidNotFail(response: PaymentResponseData): Promise<PaymentResponseData> {
    if (['Cancelled', 'Error', 'Refused'].includes(response.resultCode)) {
        return Promise.reject(response);
    }

    return Promise.resolve(response);
}

export function assertIsDropin(element: any): element is IDropin {
    if (!element) return false;

    const isDropin = typeof element.activePaymentMethod === 'object' && typeof element.closeActivePaymentMethod === 'function';
    return isDropin;
}

export function getRegulatoryDefaults(countryCode: string, isDropinInstance: boolean): Record<string, any> {
    switch (countryCode) {
        // Finnish regulations state that no payment method can be open by default
        case 'FI':
            return isDropinInstance
                ? {
                      openFirstPaymentMethod: false,
                      openFirstStoredPaymentMethod: false
                  }
                : {};
        default:
            return {};
    }
}

export function sanitizeOrder(order: Order) {
    if (!order || !order.orderData || !order.pspReference) return null;
    return {
        orderData: order.orderData,
        pspReference: order.pspReference
    };
}
