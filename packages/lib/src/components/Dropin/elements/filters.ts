import promiseTimeout from '../../../utils/promiseTimeout';
import UIElement from '../../UIElement';

export const UNSUPPORTED_PAYMENT_METHODS = ['androidpay', 'samsungpay', 'clicktopay'];

// filter payment methods that we don't support in the Drop-in
export const filterUnsupported = paymentMethod => !UNSUPPORTED_PAYMENT_METHODS.includes(paymentMethod.constructor['type']);

// filter payment methods that we support (that are in the paymentMethods/index dictionary)
export const filterPresent = paymentMethod => !!paymentMethod;

// filter payment methods that are available to the user
export const filterAvailable = (elements: UIElement[]) => {
    const elementIsAvailablePromises = elements.map(element => {
        const { promise } = promiseTimeout(5000, element.isAvailable(), {});
        return promise;
    });

    return Promise.allSettled(elementIsAvailablePromises).then(promiseResults => {
        return elements.filter((element, i) => promiseResults[i].status === 'fulfilled');
    });
};
