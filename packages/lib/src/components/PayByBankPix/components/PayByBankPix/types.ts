import { AwaitProps, IssuerListProps } from '../Enrollment/types';
import { UIElementProps } from '../../../internal/UIElement/types';

export type PayByBankPixProps = UIElementProps &
    Partial<AwaitProps> &
    Partial<IssuerListProps> & {
        setComponentRef?: (ref) => void;
        txVariant: string;
        ref?: (ref) => void;
    };
