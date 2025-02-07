import { h } from 'preact';
import { PayButtonFunctionProps } from '../../../internal/UIElement/types';
import { IssuerItem } from '../../../internal/IssuerList/types';
import { OnChangeData } from '../../../../core/types';

interface BaseEnrollmentProps {
    showPayButton: boolean;
    payButton(props: PayButtonFunctionProps): h.JSX.Element;
    onSubmitAnalytics: () => {};
    onChange?(payload: OnChangeData): void;
}

export interface AwaitProps extends BaseEnrollmentProps {
    type: 'await';
    clientKey: string;
    enrollmentId: string;
    paymentMethodType?: string;
    countdownTime?: number;
}

export interface IssuerListProps extends BaseEnrollmentProps {
    type: Exclude<string, 'await'>;
    txVariant: string;
    issuers: IssuerItem[];
}

export type EnrollmentProps = AwaitProps | IssuerListProps;

export interface IEnrollment {
    showValidation: () => {};
}
