import { UIElementProps } from '../internal/UIElement/types';
import { PayIdFormData } from './components/PayIDInput';
import { BSBFormData } from './components/BSBInput';
import { PayToComponentData } from './components/PayToComponent';

export type MandateFrequencyType = 'adhoc' | 'daily' | 'weekly' | 'biWeekly' | 'monthly' | 'quarterly' | 'halfYearly' | 'yearly';

export interface MandateType {
    amount: string;
    amountRule: string;
    frequency: MandateFrequencyType;
    startsAt?: string;
    endsAt: string;
    remarks: string;
    count?: string;
}

export interface PayToConfiguration extends UIElementProps {
    paymentData?: any;
    data?: PayToData;
    placeholders?: any; //TODO
    mandate: MandateType;
    payee?: string;
}

export interface PayToData extends PayIdFormData, BSBFormData, PayToComponentData {
    shopperAccountIdentifier: string;
}
