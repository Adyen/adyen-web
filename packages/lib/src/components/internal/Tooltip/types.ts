import { MutableRef } from 'preact/hooks';

export interface TooltipProps<T extends HTMLElement = HTMLElement> {
    text?: string;
    visible?: boolean;
    anchorRef?: MutableRef<T>;
    id?: string;
}

export type TooltipPosition = 'top' | 'bottom';
