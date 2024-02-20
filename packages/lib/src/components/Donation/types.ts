import { UIElementProps } from '../internal/UIElement/types';
import DonationElement from './Donation';
import { DonationComponentProps, DonationPayload } from './components/types';

export type DonationElementProps = UIElementProps &
    Omit<DonationComponentProps, 'onDonate' | 'onCancel'> & {
        onDonate(data: DonationPayload, component: DonationElement): void;
        onCancel(data: DonationPayload): void;
    };
