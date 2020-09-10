import actionTypes from './actionTypes';
import { PaymentAction } from '../../../types';

export function getComponentForAction(action: PaymentAction, props = {}) {
    const nextAction = actionTypes[action.type];

    if (nextAction && typeof nextAction === 'function') {
        return nextAction(action, props);
    }

    throw new Error('Invalid Action');
}

export default getComponentForAction;
