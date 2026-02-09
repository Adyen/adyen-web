import { h } from 'preact';
import { IssuerItem } from '../../../internal/IssuerList/types';
import { OnChangeData } from '../../../../core/types';
import { IPayByBankPixAwait } from './components/PayByBankPixAwait';
import { AbstractAnalyticsEvent } from '../../../../core/Analytics/events/AbstractAnalyticsEvent';
import { AdyenCheckoutError } from '../../../../types';
import { PayButtonProps } from '../../../internal/PayButton/PayButton';

interface BaseEnrollmentProps {
    type?: string;
    txVariant: string;
    registrationOptions?: string;
    payButton(props: PayButtonProps): h.JSX.Element;
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
    onSubmitAnalytics?: (aObj: AbstractAnalyticsEvent) => void;
    onChange?(payload: OnChangeData): void;
}

export type EnrollmentProps = AwaitProps | IssuerListProps;
