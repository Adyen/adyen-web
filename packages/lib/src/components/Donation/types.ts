import { UIElementProps } from '../internal/UIElement/types';
import DonationElement from './Donation';

export interface DonationConfiguration extends UIElementProps {
    onDonate(data: any, component: DonationElement): void;
    onCancel(data: any): void;
}
