import { h, RefObject } from 'preact';
import { PayButtonFunctionProps } from '../../../internal/UIElement/types';
import { IssuerItem } from '../../../internal/IssuerList/types';
import Enrollment from './Enrollment';
import { OnChangeData } from '../../../../core/types';

export interface EnrollmentProps {
    txVariant: string;
    type?: 'await' | 'redirect';
    /**
     * For await component
     */
    url?: string;
    paymentMethodType?: string;
    timeoutMinutes?: number;
    /**
     * For Issuer list
     */
    issuers: IssuerItem[];
    clientKey?: string;
    showPayButton: boolean;
    payButton(props: PayButtonFunctionProps): h.JSX.Element;
    onSubmitAnalytics: () => {};
    onChange?(payload: OnChangeData): void;
}

export interface IEnrollment {
    showValidation: () => {};
}
