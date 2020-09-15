import {
    VALIDATION_ERROR,
    CONFIGURATION_ERROR,
    DEV_ERROR,
    APP_ERROR,
    ERROR_CODES,
    ERROR_MSG_NO_KEYS,
    ERROR_MSG_NO_ROOT_NODE,
    ERROR_MSG_COMP_ALREADY_MOUNTED,
    ERROR_MSG_COMP_NOT_MOUNTED,
    ERROR_MSG_INVALID_PM_NAME,
    ERROR_MSG_INVALID_COMP,
    ERROR_MSG_NO_RENDER_METHOD,
    ERROR_MSG_INVALID_ACTION,
    ERROR_MSG_NO_ACTION,
    ERROR_MSG_INCORRECT_PMR,
    ERROR_MSG_NO_PAYPAL_TOKEN
} from './constants';

export function errorHandler(errorObj, compRef) {
    console.log('### ErrorHandler::errorHandler:: errorObj', errorObj);
    // console.log('### ErrorHandler::errorHandler:: compRef', compRef);
    // console.log('### ErrorHandler::errorHandler:: this.componentRef', this.componentRef);
    // console.log('### ErrorHandler::errorHandler:: this', this);

    if (errorObj instanceof Error) {
        console.log('### ErrorHandler::errorHandler:: is an Error Error');
    }

    const code = errorObj.error;
    const info = errorObj.info;

    /**
     * Validation errors
     */
    if (code.indexOf(VALIDATION_ERROR) > -1) {
        compRef.props.onErrorRef(errorObj);
        return;
    }

    /**
     * Configuration errors
     */
    if (code.indexOf(CONFIGURATION_ERROR) > -1) {
        switch (code) {
            case ERROR_CODES[ERROR_MSG_NO_KEYS]:
                console.warn(
                    'WARNING: Checkout configuration object is missing a "clientKey" or an "originKey" property. \nAn originKey will be accepted but this will eventually be deprecated'
                );
                // Show a "configuration error" message in the component - see CardInput.tsx for example
                if (this.componentRef) this.componentRef.setState({ status: 'keyError' });
                break;

            case ERROR_CODES[ERROR_MSG_NO_ROOT_NODE]:
                throw new Error(`${ERROR_MSG_NO_ROOT_NODE}. The element you are trying to mount the component into could not be found.`);
                break;

            case ERROR_CODES[ERROR_MSG_COMP_ALREADY_MOUNTED]:
                throw new Error(`${ERROR_MSG_COMP_ALREADY_MOUNTED}. The element you are trying to mount the component into could not be found.`);
                break;

            case ERROR_CODES[ERROR_MSG_COMP_NOT_MOUNTED]:
                throw new Error(`${ERROR_MSG_COMP_NOT_MOUNTED}.`);
                break;

            case ERROR_CODES[ERROR_MSG_INVALID_PM_NAME]:
                throw new Error(`${info} is ${ERROR_MSG_INVALID_PM_NAME}.`);
                break;

            case ERROR_CODES[ERROR_MSG_INVALID_COMP]:
                throw new Error(`${ERROR_MSG_INVALID_COMP}.`);
                break;

            case ERROR_CODES[ERROR_MSG_INCORRECT_PMR]:
                throw new Error(
                    `${ERROR_MSG_INCORRECT_PMR} (should be an object but a string was provided). Try JSON.parse("{...}") your paymentMethodsResponse.`
                );
                break;
        }
        return;
    }

    /**
     * Developer errors
     */
    if (code.indexOf(DEV_ERROR) > -1) {
        switch (code) {
            case ERROR_CODES[ERROR_MSG_NO_RENDER_METHOD]:
                throw new Error(`${ERROR_MSG_NO_RENDER_METHOD}. You have not defined an render method in a component that extends UIElement`);
                break;
        }
        return;
    }

    /**
     * Application errors
     */
    if (code.indexOf(APP_ERROR) > -1) {
        let errorMsg;

        switch (code) {
            case ERROR_CODES[ERROR_MSG_INVALID_ACTION]:
                errorMsg = `${ERROR_MSG_INVALID_ACTION}.`;
                if (info) errorMsg += ` ${info}`;
                throw new Error(errorMsg);
                break;

            case ERROR_CODES[ERROR_MSG_NO_ACTION]:
                throw new Error(`${ERROR_MSG_NO_ACTION}.`);
                break;

            case ERROR_CODES[ERROR_MSG_NO_PAYPAL_TOKEN]:
                return new Error(`${ERROR_MSG_NO_PAYPAL_TOKEN}.`);
                break;
        }
        return;
    }

    console.error('Unknown error:', code);
}
