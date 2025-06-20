import { TooltipProps } from './types';
import { getUniqueId } from '../../../utils/idGenerator';

type setTooltipState = (state: TooltipProps | null) => void;

export class TooltipController {
    public static tooltipId = getUniqueId('adyen-checkout-tooltip');
    private static DEFAULT_TIMEOUT = 100;
    private static timeoutId: ReturnType<typeof setTimeout> | null = null;
    private static registered = false;
    private static updateGlobalTooltip: setTooltipState = () => {};

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
}
