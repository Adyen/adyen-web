import { AwaitProps, IssuerListProps } from '../Enrollment/types';
import { UIElementProps } from '../../../internal/UIElement/types';
import { PasskeyService } from '../../services/PasskeyService';

export type Enrollment = { enrollmentId: string; fidoAssertion: string };

export type PayByBankPixProps = UIElementProps &
    Partial<AwaitProps> &
    Partial<IssuerListProps> & {
        setComponentRef?: (ref) => void;
        txVariant: string;
        ref?: (ref) => void;
        passkeyService?: PasskeyService;
        onEnrollment?: (enrollment: Enrollment) => void;
        onPayment?: (payment: any) => void; // //todo: typing
    };
