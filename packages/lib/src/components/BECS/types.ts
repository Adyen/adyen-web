import type { UIElementProps } from '../internal/UIElement/types';

export interface BECSFormData {
    holderName?: string;
    bankBranchCode?: string;
    bankAccountNumber?: string;
    shopperEmail?: string;
}

export interface BECSConfiguration extends UIElementProps {
    data?: BECSFormData;
    placeholders?: BECSFormData;
    url?: string;
}
