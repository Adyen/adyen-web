import { h } from 'preact';
import { useMemo } from 'preact/hooks';
import { useCoreContext } from '../../core/Context/CoreProvider';
import Field from '../internal/FormFields/Field';
import Select from '../internal/FormFields/Select';
import { transformOffersToDiscounts, transformDetailItemsToPlans } from './offers/transformers';

import type { SelectItem } from '../internal/FormFields/Select/types';
import type { EMIDetailItem, EMIOffer } from './offers/types';

interface EMIOfferFormProps {
    provider: string;
    discount: string;
    plan: string;
    onFieldChange: (field: string) => (e: { target: { value: string } }) => void;
    errors: Record<string, any>;
    providers?: SelectItem[];
    discounts?: SelectItem[];
    plans?: SelectItem[];
    rawOffers?: EMIOffer[];
    rawDetails?: EMIDetailItem[];
    cardBrand?: string;
    amount?: number;
    currency?: string;
}


export const EMIOfferForm = ({
    provider,
    discount,
    plan,
    onFieldChange,
    errors,
    providers,
    discounts,
    plans,
    rawOffers,
    rawDetails,
    cardBrand,
    amount = 100000,
    currency = 'INR'
}: Readonly<EMIOfferFormProps>) => {
    const { i18n } = useCoreContext();

    const filteredDiscounts = useMemo(() => {
        if (rawOffers && provider) {
            return transformOffersToDiscounts(rawOffers, provider);
        }
        return discounts ?? [];
    }, [rawOffers, provider, discounts]);

    const filteredPlans = useMemo(() => {
        if (rawDetails && cardBrand) {
            return transformDetailItemsToPlans(rawDetails, amount, currency, cardBrand);
        }
        return plans ?? [];
    }, [rawDetails, cardBrand, amount, currency, plans]);

    const getErrorMessage = (error: any) => (error && error.errorMessage ? i18n.get(error.errorMessage) : !!error);

    return (
        <div className="adyen-checkout__emi-offer-form">
            <Field label="Provider" errorMessage={getErrorMessage(errors.provider)} classNameModifiers={['provider']} name="provider">
                <Select items={providers} selectedValue={provider} name="provider" onChange={onFieldChange('provider')} filterable={false} />
            </Field>

            <Field label="Discount" errorMessage={getErrorMessage(errors.discount)} classNameModifiers={['discount']} name="discount">
                <Select items={filteredDiscounts} selectedValue={discount} name="discount" onChange={onFieldChange('discount')} filterable={false} />
            </Field>

            <Field label="Plan" errorMessage={getErrorMessage(errors.plan)} classNameModifiers={['plan']} name="plan">
                <Select items={filteredPlans} selectedValue={plan} name="plan" onChange={onFieldChange('plan')} filterable={false} />
            </Field>
        </div>
    );
};
