import { h, RefObject } from 'preact';
import { PayButtonFunctionProps } from '../../../internal/UIElement/types';
import { IssuerItem } from '../../../internal/IssuerList/types';
import Enrollment from './Enrollment';

export interface EnrollmentProps {
    type?: 'await' | 'redirect';
    /**
     * For await component
     */
    url?: string;
    paymentMethodType?: string;
    /**
     * For Issuer list
     */
    issuers: IssuerItem[];

    showPayButton: boolean;
    payButton(props: PayButtonFunctionProps): h.JSX.Element;
    ref(ref: RefObject<typeof Enrollment>): void;
    onSubmitAnalytics: () => {};
    onChange: () => {};
}
