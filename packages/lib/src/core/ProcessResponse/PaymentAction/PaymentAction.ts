import actionTypes from './actionTypes';
import { PaymentAction } from '../../../types';
import { ERROR_CODES, ERROR_MSG_INVALID_ACTION } from '../../Errors/constants';

export function getComponentForAction(action: PaymentAction, props = {}) {
    const nextAction = actionTypes[action.type];

    if (nextAction && typeof nextAction === 'function') {
        return nextAction(action, props);
    }

    // TODO fix [] access with TS
    props['onError']({ error: ERROR_CODES[ERROR_MSG_INVALID_ACTION], info: `type=${action.type}` });
}

export default getComponentForAction;
