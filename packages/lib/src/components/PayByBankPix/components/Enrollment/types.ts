import { h } from 'preact';
import { PayButtonFunctionProps } from '../../../internal/UIElement/types';
import { IssuerItem } from '../../../internal/IssuerList/types';
import { OnChangeData } from '../../../../core/types';
import { IPayByBankPixAwait } from './components/PayByBankPixAwait';
import { AnalyticsEvent } from '../../../../core/Analytics/AnalyticsEvent';
import { AdyenCheckoutError } from '../../../../types';

interface BaseEnrollmentProps {
    type?: string;
    txVariant: string;
    registrationOptions?: string;
    payButton(props: PayButtonFunctionProps): h.JSX.Element;
    setComponentRef?: (ref) => void;
    /**
     * Trigger when the await times out, receives error state or the biometrics verification fails.
     */
    onError?: (error: AdyenCheckoutError) => void;
    onEnroll?: (registrationOptions: string) => void;
}

export interface AwaitProps extends Partial<IPayByBankPixAwait>, BaseEnrollmentProps {
    type: 'await';
    enrollmentId: string;
}

export interface IssuerListProps extends BaseEnrollmentProps {
    issuers?: IssuerItem[];
    /**
     * @internal
     */
    onSubmitAnalytics?: (aObj: AnalyticsEvent) => void;
    onChange?(payload: OnChangeData): void;
}

export type EnrollmentProps = AwaitProps | IssuerListProps;
