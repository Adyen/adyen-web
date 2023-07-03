import actionTypes from './actionTypes';
import { PaymentAction } from '../../../types';
import Registry from '../../core.registry';

export function getComponentForAction(registry: typeof Registry, action: PaymentAction, props = {}) {
    const nextAction = actionTypes[action.type];

    if (nextAction && typeof nextAction === 'function') {
        return nextAction(registry, action, props);
    }

    throw new Error('Invalid Action');
}

export default getComponentForAction;
