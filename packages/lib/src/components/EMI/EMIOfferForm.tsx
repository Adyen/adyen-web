import { h } from 'preact';
import { useCoreContext } from '../../core/Context/CoreProvider';
import Field from '../internal/FormFields/Field';
import Select from '../internal/FormFields/Select';

import type { SelectItem } from '../internal/FormFields/Select/types';

interface EMIOfferFormProps {
    provider: string;
    discount: string;
    plan: string;
    onFieldChange: (field: string) => (e: { target: { value: string } }) => void;
    errors: Record<string, any>;
}

const MOCK_PROVIDERS: SelectItem[] = [
    { id: 'hdfc', name: 'HDFC Credit Cards' },
    { id: 'icici', name: 'ICICI Credit Cards' },
    { id: 'axis', name: 'Axis Credit Cards' }
];

const MOCK_DISCOUNTS: SelectItem[] = [
    { id: 'discount1', name: '-5% money back for HDFC plans' },
    { id: 'discount2', name: '-3% money back for all plans' },
    { id: 'discount3', name: 'No discount' }
];

const MOCK_PLANS: SelectItem[] = [
    { id: 'plan1', name: '$3,656.64 x 9 months' },
    { id: 'plan2', name: '$1,828.32 x 18 months' },
    { id: 'plan3', name: '$914.16 x 36 months' }
];

export const EMIOfferForm = ({ provider, discount, plan, onFieldChange, errors }: Readonly<EMIOfferFormProps>) => {
    const { i18n } = useCoreContext();

    const getErrorMessage = (error: any) => (error && error.errorMessage ? i18n.get(error.errorMessage) : !!error);

    return (
        <div className="adyen-checkout__emi-offer-form">
            <Field label="Provider" errorMessage={getErrorMessage(errors.provider)} classNameModifiers={['provider']} name="provider">
                <Select items={MOCK_PROVIDERS} selectedValue={provider} name="provider" onChange={onFieldChange('provider')} filterable={false} />
            </Field>

            <Field label="Discount" errorMessage={getErrorMessage(errors.discount)} classNameModifiers={['discount']} name="discount">
                <Select items={MOCK_DISCOUNTS} selectedValue={discount} name="discount" onChange={onFieldChange('discount')} filterable={false} />
            </Field>

            <Field label="Plan" errorMessage={getErrorMessage(errors.plan)} classNameModifiers={['plan']} name="plan">
                <Select items={MOCK_PLANS} selectedValue={plan} name="plan" onChange={onFieldChange('plan')} filterable={false} />
            </Field>
        </div>
    );
};
