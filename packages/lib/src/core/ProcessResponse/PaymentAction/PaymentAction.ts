import actionTypes from './actionTypes';
import type { PaymentAction } from '../../../types/global-types';
import type { IRegistry } from '../../core.registry';
import type { ICore } from '../../types';
import UIElement from '../../../components/internal/UIElement';

export function getComponentForAction(core: ICore, registry: IRegistry, action: PaymentAction, props = {}): UIElement {
    const nextAction = actionTypes[action.type];

    if (nextAction && typeof nextAction === 'function') {
        return nextAction(core, registry, action, props);
    }

    throw new Error('Invalid Action');
}

export default getComponentForAction;
