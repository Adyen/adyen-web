import actionTypes from './actionTypes';
import { PaymentAction } from '../../../types';
import type { IRegistry } from '../../core.registry';
import { ICore } from '../../types';

export function getComponentForAction(core: ICore, registry: IRegistry, action: PaymentAction, props = {}) {
    const nextAction = actionTypes[action.type];

    if (nextAction && typeof nextAction === 'function') {
        return nextAction(core, registry, action, props);
    }

    throw new Error('Invalid Action');
}

export default getComponentForAction;
