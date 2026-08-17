import { h, Fragment } from 'preact';
import Alert from '../../../internal/Alert';
import Field from '../../../internal/FormFields/Field';
import Select from '../../../internal/FormFields/Select';
import { PREFIX } from '../../../internal/Icon/constants';
import { TagVariant } from '../../../internal/Tag/types';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import useImage from '../../../../core/Context/useImage';
import getIssuerImageUrl from '../../../../utils/get-issuer-image';
import { TxVariants } from '../../../tx-variants';
import { BASIS_POINTS_IN_A_UNIT, getLocalisedPercentage } from '../../../../utils/percentage-util';
import type { EmiIssuerOption, EmiPlanOption, EmiPlanTypeKey, EmiSelection } from '../../types';
import type { PaymentAmount } from '../../../../types/global-types';
import type { SelectItem, SelectTargetObject } from '../../../internal/FormFields/Select/types';
import type { TagProps } from '../../../internal/Tag/types';
import styles from './EMIPlanSelection.module.scss';

interface EMIPlanSelectionProps {
    issuers: EmiIssuerOption[];
    selection: EmiSelection;
    onSelectionChange(selection: EmiSelection): void;
}

const PLAN_TAG: Partial<Record<EmiPlanTypeKey, { translationKey: string; variant: TagVariant }>> = {
    noCost: { translationKey: 'emi.noCost', variant: TagVariant.SUCCESS },
    lowCost: { translationKey: 'emi.lowCost', variant: TagVariant.INFO }
};

export function EMIPlanSelection({ issuers, selection, onSelectionChange }: Readonly<EMIPlanSelectionProps>): h.JSX.Element {
    const { i18n, loadingContext } = useCoreContext();
    const getImage = useImage();

    const { issuer: selectedIssuer, plan: selectedPlan } = selection;

    // Switching provider activates that provider's first plan, so the two selects stay consistent
    const selectIssuer = (issuerId: string) => {
        const issuer = issuers.find(item => item.id === issuerId);
        const firstPlan = issuer?.plans[0];

        if (!issuer || !firstPlan) return;

        onSelectionChange({ issuer, plan: firstPlan });
    };

    const selectPlan = (planId: string) => {
        const plan = selectedIssuer.plans.find(item => item.id === planId);

        if (!plan) return;

        onSelectionChange({ issuer: selectedIssuer, plan });
    };

    const getPlanLabel = (plan: EmiPlanOption): string => {
        const tenure = i18n.get('installmentOptionMonths', { values: { times: String(plan.tenureMonths) } });
        const label = plan.monthlyPayableAmount
            ? `${i18n.amount(plan.monthlyPayableAmount.value, plan.monthlyPayableAmount.currency)} x ${tenure}`
            : tenure;

        // A no-cost plan carries the bank rate for the summary, but the shopper is not charged it
        if (plan.type === 'noCost') return label;

        const interestRate = getLocalisedPercentage(plan.interestRateBps / BASIS_POINTS_IN_A_UNIT, i18n.locale);

        return `${label} | @${interestRate} ${i18n.get('emi.perAnnum')}`;
    };

    const getPlanTags = (plan?: EmiPlanOption): TagProps[] | undefined => {
        const tag = plan && PLAN_TAG[plan.type];
        return tag ? [{ label: i18n.get(tag.translationKey), variant: tag.variant }] : undefined;
    };

    const formatDiscount = (amount: PaymentAmount): string => `-${i18n.amount(amount.value, amount.currency)}`;

    const getPlanDiscountText = (plan?: EmiPlanOption): string | undefined => {
        const offer = plan?.selectedOffer;
        return offer ? `${formatDiscount(offer.amount)} ${i18n.get('emi.discountAvailable')}` : undefined;
    };

    const getIssuerIcon = getIssuerImageUrl({ loadingContext }, TxVariants.emi, getImage);

    const issuerItems: SelectItem[] = issuers.map(issuer => {
        // The collapsed row previews the selected plan; every other row previews the plan that
        // selecting that issuer would activate, so the preview always matches the outcome
        const previewPlan = issuer.id === selectedIssuer.id ? selectedPlan : issuer.plans[0];

        return {
            id: issuer.id,
            name: issuer.name,
            icon: getIssuerIcon(issuer.id),
            tags: getPlanTags(previewPlan),
            secondaryText: getPlanDiscountText(previewPlan)
        };
    });

    const planItems: SelectItem[] = selectedIssuer.plans.map(plan => ({
        id: plan.id,
        name: getPlanLabel(plan),
        tags: getPlanTags(plan),
        secondaryText: getPlanDiscountText(plan)
    }));

    return (
        <Fragment>
            <div className={styles.planSelection}>
                <Field name={'emiProvider'} label={i18n.get('emi.provider')} showContextualElement={false}>
                    <Select
                        name={'emiProvider'}
                        filterable={false}
                        items={issuerItems}
                        selectedValue={selectedIssuer.id}
                        onChange={event => selectIssuer(String((event.target as SelectTargetObject).value))}
                    />
                </Field>

                <Field name={'emiPlan'} label={i18n.get('emi.plan')} showContextualElement={false}>
                    <Select
                        name={'emiPlan'}
                        filterable={false}
                        items={planItems}
                        selectedValue={selectedPlan.id}
                        onChange={event => selectPlan(String((event.target as SelectTargetObject).value))}
                    />
                </Field>
            </div>

            {selectedPlan.selectedOffer && (
                <Alert type={'success'} icon={`${PREFIX}checkmark_black`}>
                    {i18n.get('emi.discountApplied', {
                        values: { amount: formatDiscount(selectedPlan.selectedOffer.amount), provider: selectedIssuer.name }
                    })}
                </Alert>
            )}
        </Fragment>
    );
}
