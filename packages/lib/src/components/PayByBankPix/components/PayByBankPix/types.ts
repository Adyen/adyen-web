import { AwaitProps, IssuerListProps } from '../Enrollment/types';
import { UIElementProps } from '../../../internal/UIElement/types';
import { PaymentProps } from '../Payment/types';
import { RiskSignalsAuthentication } from '../../services/types';

export type Enrollment = { enrollmentId: string; fidoAssertion: string };
export type Payment = { riskSignals: RiskSignalsAuthentication; authenticatedCredential: string };

export type PayByBankPixProps = UIElementProps &
    Partial<AwaitProps> &
    Partial<IssuerListProps> &
    Partial<PaymentProps> & {
        txVariant: string;
        deviceId?: string;
        onEnrollment?: (enrollment: Enrollment) => void;
        onPayment?: (payment: Payment) => void;
    };
