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
    ERROR_MSG_NO_ACTION
} from './constants';
import * as logger from '../../components/internal/SecuredFields/lib/utilities/logger';

export function errorHandler(errorObj) {
    console.log('### ErrorHandler::errorHandler:: errorObj', errorObj);

    if (errorObj instanceof Error) {
        console.log('### ErrorHandler::errorHandler:: is an Error Error');
    }

    const code = errorObj.error;
    const info = errorObj.info;

    if (code.indexOf(VALIDATION_ERROR) > -1) {
        this.props.onErrorRef(errorObj);
        return;
    }

    if (code.indexOf(CONFIGURATION_ERROR) > -1) {
        switch (code) {
            case ERROR_CODES[ERROR_MSG_NO_KEYS]:
                logger.warn(
                    'WARNING: Checkout configuration object is missing a "clientKey" or an "originKey" property. \nAn originKey will be accepted but this will eventually be deprecated'
                );
                // Show a "configuration error" message in the component
                this.componentRef.setState({ status: 'keyError' });
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
        }
        return;
    }

    if (code.indexOf(DEV_ERROR) > -1) {
        switch (code) {
            case ERROR_CODES[ERROR_MSG_NO_RENDER_METHOD]:
                throw new Error(`${ERROR_MSG_NO_RENDER_METHOD}. You have not defined an render method in the component that extends UIElement`);
                break;
        }
        return;
    }

    if (code.indexOf(APP_ERROR) > -1) {
        switch (code) {
            case ERROR_CODES[ERROR_MSG_INVALID_ACTION]:
                throw new Error(`${ERROR_MSG_INVALID_ACTION}.`);
                break;

            case ERROR_CODES[ERROR_MSG_NO_ACTION]:
                throw new Error(`${ERROR_MSG_NO_ACTION}.`);
                break;
        }
        return;
    }
}
