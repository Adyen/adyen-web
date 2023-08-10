import actionTypes from './actionTypes';
import { PaymentAction } from '../../../types';
import type { IRegistry } from '../../core.registry';

export function getComponentForAction(checkout, registry: IRegistry, action: PaymentAction, props = {}) {
    const nextAction = actionTypes[action.type];

    if (nextAction && typeof nextAction === 'function') {
        return nextAction(checkout, registry, action, props);
    }

    throw new Error('Invalid Action');
}

export default getComponentForAction;
