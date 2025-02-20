import { h } from 'preact';
import { PayButtonFunctionProps } from '../../../internal/UIElement/types';
import { IssuerItem } from '../../../internal/IssuerList/types';
import { OnChangeData } from '../../../../core/types';
import { SendAnalyticsObject } from '../../../../core/Analytics/types';

interface BaseEnrollmentProps {
    type?: string;
    payButton(props: PayButtonFunctionProps): h.JSX.Element;
    ref: any;
    /**
     * Trigger when the await times out, receives error state or the biometrics verification fails.
     */
    onError?: (error) => void;
    onComplete?: (payload: any) => void;
}

export interface AwaitProps extends BaseEnrollmentProps {
    type: 'await';
    clientKey: string;
    enrollmentId: string;
    paymentMethodType?: string;
    countdownTime?: number;
}

export interface IssuerListProps extends BaseEnrollmentProps {
    txVariant: string;
    issuers?: IssuerItem[];
    /**
     * @internal
     */
    onSubmitAnalytics?: (aObj: SendAnalyticsObject) => void;
    onChange?(payload: OnChangeData): void;
}

export type EnrollmentProps = AwaitProps | IssuerListProps;

export interface IEnrollment {
    showValidation: () => {};
}
