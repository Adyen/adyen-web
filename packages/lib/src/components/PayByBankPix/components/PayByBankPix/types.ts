import { AwaitProps, IssuerListProps } from '../Enrollment/types';
import { UIElementProps } from '../../../internal/UIElement/types';
import { PasskeyService } from '../../services/PasskeyService';
import { PaymentProps } from '../Payment/types';

export type PayByBankPixProps = UIElementProps &
    Partial<AwaitProps> &
    Partial<IssuerListProps> &
    Partial<PaymentProps> & {
        setComponentRef?: (ref) => void;
        txVariant: string;
        ref?: (ref) => void;
        passkeyService?: PasskeyService;
        onEnrollment?: (enrollment: any) => void; //todo: typing
        onPayment?: (payment: any) => void; // //todo: typing
    };
