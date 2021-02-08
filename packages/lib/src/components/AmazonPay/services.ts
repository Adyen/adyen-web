import { httpPost } from '../../core/Services/http';
import { AMAZONPAY_SIGN_STRING_ENDPOINT, AMAZONPAY_UPDATE_CHECKOUT_SESSION_ENDPOINT, AMAZONPAY_GET_CHECKOUT_DETAILS_ENDPOINT } from './config';
import { CheckoutDetailsRequest, PayloadJSON, UpdateAmazonCheckoutSessionRequest } from './types';

/**
 * Calls the Sign String endpoint to the PayloadJSON string.
 * @param loadingContext - Loading context to be used in the call
 * @param clientKey - Key to be used as a public token
 * @param payloadJSON - Object to be signed
 * @returns A promise containing the response of the call
 */
export function getAmazonSignature(loadingContext: string, clientKey: string, payloadJSON: PayloadJSON): Promise<any> {
    const options = {
        loadingContext,
        path: `${AMAZONPAY_SIGN_STRING_ENDPOINT}?clientKey=${clientKey}`
    };

    const request = { stringToSign: JSON.stringify(payloadJSON) };

    return httpPost(options, request);
}

/**
 * Calls the getCheckoutDetails details to either get the shopper details or the decline flow URL.
 * @param loadingContext - Loading context to be used in the call
 * @param clientKey - Key to be used as a public token
 * @param request - Object to sent
 * @returns A promise containing the response of the call
 */
export function getCheckoutDetails(loadingContext: string, clientKey: string, request: CheckoutDetailsRequest): Promise<any> {
    const options = {
        loadingContext,
        path: `${AMAZONPAY_GET_CHECKOUT_DETAILS_ENDPOINT}?clientKey=${clientKey}`
    };

    return httpPost(options, request);
}

/**
 * Calls the Update Checkout Session endpoint to create an order.
 * @param loadingContext - Loading context to be used in the call
 * @param clientKey - Key to be used as a public token
 * @param data -
 * @returns A promise containing the response of the call
 */
export function updateAmazonCheckoutSession(loadingContext: string, clientKey: string, data: UpdateAmazonCheckoutSessionRequest): Promise<any> {
    const options = {
        loadingContext,
        path: `${AMAZONPAY_UPDATE_CHECKOUT_SESSION_ENDPOINT}?clientKey=${clientKey}`
    };

    return httpPost(options, data);
}
