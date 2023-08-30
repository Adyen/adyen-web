import actionTypes from './actionTypes';
import { PaymentAction } from '../../../types';
import type { IRegistry } from '../../core.registry';
import Core from '../../core';

export function getComponentForAction(core: Core, registry: IRegistry, action: PaymentAction, props = {}) {
    const nextAction = actionTypes[action.type];

    if (nextAction && typeof nextAction === 'function') {
        return nextAction(core, registry, action, props);
    }

    throw new Error('Invalid Action');
}

export default getComponentForAction;
