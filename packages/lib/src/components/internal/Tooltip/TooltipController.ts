import { TooltipProps } from './types';
import { getUniqueId } from '../../../utils/idGenerator';

type setTooltipState = (state: TooltipProps | null) => void;

export class TooltipController {
    public static readonly tooltipId = getUniqueId('adyen-checkout-tooltip');
    private static readonly DEFAULT_TIMEOUT = 100;
    private static readonly PRIMARY_TOOLTIP_RESET_EVENT = 'primary-tooltip-reset';
    private static timeoutId: ReturnType<typeof setTimeout> | null = null;
    private static registered = false;
    private static updateGlobalTooltip: setTooltipState = () => {};
    private static eventTarget = new EventTarget();

    public static registerTooltipHandler(fn: setTooltipState): void {
        this.updateGlobalTooltip = fn;
        this.registered = true;
    }

    public static canRegisterTooltipHandler(): boolean {
        return !this.registered;
    }

    public static showTooltip(state?: TooltipProps) {
        clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(() => this.updateGlobalTooltip({ ...state, visible: true }), this.DEFAULT_TIMEOUT);
    }

    public static hideTooltip(state?: TooltipProps) {
        clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(() => this.updateGlobalTooltip({ ...state, visible: false }), this.DEFAULT_TIMEOUT);
    }

    public static reset() {
        this.registered = false;
        this.updateGlobalTooltip = () => {};
        this.notifyPrimaryReset();
    }

    private static notifyPrimaryReset() {
        this.eventTarget.dispatchEvent(new Event(TooltipController.PRIMARY_TOOLTIP_RESET_EVENT));
    }

    public static onPrimaryReset(callback: () => void) {
        this.eventTarget.addEventListener(TooltipController.PRIMARY_TOOLTIP_RESET_EVENT, callback);
        return () => this.eventTarget.removeEventListener(TooltipController.PRIMARY_TOOLTIP_RESET_EVENT, callback);
    }
}
