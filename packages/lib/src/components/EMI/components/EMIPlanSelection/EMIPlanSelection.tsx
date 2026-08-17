import { h } from 'preact';
import Field from '../../../internal/FormFields/Field';
import Select from '../../../internal/FormFields/Select';
import { TagVariant } from '../../../internal/Tag/types';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import useImage from '../../../../core/Context/useImage';
import getIssuerImageUrl from '../../../../utils/get-issuer-image';
import { TxVariants } from '../../../tx-variants';
import { getLocalisedPercentageFromBasisPoints } from '../../../../utils/percentage-util';
import { selectDisplayOffer } from '../../utils';
import type { EmiIssuer, EmiPlan, EmiPlanTypeKey, EmiSelection } from '../../types';
import type { PaymentAmount } from '../../../../types/global-types';
import type { SelectItem, SelectTargetObject } from '../../../internal/FormFields/Select/types';
import type { TagProps } from '../../../internal/Tag/types';
import styles from './EMIPlanSelection.module.scss';

interface EMIPlanSelectionProps {
    issuers: EmiIssuer[];
    selection: EmiSelection;
    onSelectionChange(selection: EmiSelection): void;
    /** Id of the heading naming this section. */
    labelledBy?: string;
    /** Id of the copy describing this section. */
    describedBy?: string;
}

const PLAN_TAG: Partial<Record<EmiPlanTypeKey, { translationKey: string; variant: TagVariant }>> = {
    noCost: { translationKey: 'emi.noCost', variant: TagVariant.SUCCESS },
    lowCost: { translationKey: 'emi.lowCost', variant: TagVariant.INFO }
};

// See ADR-0004-emi-plans-data-transformation for the select-only identity and uniqueness rules.
const toItemId = (prefix: string, segments: (string | number)[]): string =>
    [prefix, ...segments].map(segment => encodeURIComponent(segment)).join(':');

const getIssuerId = (issuer: EmiIssuer): string => toItemId('issuer', [issuer.issuerCode, issuer.fundingSource]);

const getPlanId = (issuer: EmiIssuer, plan: EmiPlan): string =>
    toItemId('plan', [issuer.issuerCode, issuer.fundingSource, plan.type, plan.tenureMonths]);

export function EMIPlanSelection({ issuers, selection, onSelectionChange, labelledBy, describedBy }: Readonly<EMIPlanSelectionProps>): h.JSX.Element {
    const { i18n, loadingContext } = useCoreContext();
    const getImage = useImage();

    const { issuer: selectedIssuer, plan: selectedPlan } = selection;

    const selectedIssuerId = getIssuerId(selectedIssuer);
    const selectedPlanId = getPlanId(selectedIssuer, selectedPlan);

    // Switching provider activates that provider's first plan, so the two selects stay consistent
    const selectIssuer = (id: string) => {
        // Unique per response, so the first match is the only one
        const issuer = issuers.find(candidate => getIssuerId(candidate) === id);
        if (!issuer) return;

        onSelectionChange({ issuer, plan: issuer.plans[0] });
    };

    const selectPlan = (id: string) => {
        const plan = selectedIssuer.plans.find(candidate => getPlanId(selectedIssuer, candidate) === id);
        if (!plan) return;

        onSelectionChange({ issuer: selectedIssuer, plan });
    };

    const getPlanLabel = (plan: EmiPlan): string => {
        const { monthlyPayableAmount } = plan.transactionAmounts;
        const tenure = i18n.get('installmentOptionMonths', { values: { times: String(plan.tenureMonths) } });
        const label = `${i18n.amount(monthlyPayableAmount.value, monthlyPayableAmount.currency)} x ${tenure}`;

        // A no-cost plan carries the bank rate for the summary, but the shopper is not charged it
        if (plan.type === 'noCost') return label;

        const interestRate = getLocalisedPercentageFromBasisPoints(plan.interestRateBps, i18n.locale);

        return `${label} | @${interestRate} ${i18n.get('emi.perAnnum')}`;
    };

    const getPlanTags = (plan: EmiPlan): TagProps[] | undefined => {
        const tag = PLAN_TAG[plan.type];
        return tag ? [{ label: i18n.get(tag.translationKey), variant: tag.variant }] : undefined;
    };

    // The locale places the minus sign, the same way it places the currency symbol
    const formatDiscount = ({ value, currency }: PaymentAmount): string => i18n.amount(-value, currency);

    const getPlanDiscountText = (plan: EmiPlan): string | undefined => {
        const offer = selectDisplayOffer(plan.offers);
        return offer ? `${formatDiscount(offer.amount)} ${i18n.get('emi.discountAvailable')}` : undefined;
    };

    const getIssuerIcon = getIssuerImageUrl({ loadingContext }, TxVariants.emi, getImage);

    const issuerItems: SelectItem[] = issuers.map(issuer => {
        // The collapsed row previews the selected plan; every other row previews the plan that
        // selecting that issuer would activate, so the preview always matches the outcome
        const previewPlan = issuer === selectedIssuer ? selectedPlan : issuer.plans[0];

        return {
            id: getIssuerId(issuer),
            name: issuer.issuerName,
            icon: getIssuerIcon(issuer.issuerCode.toLowerCase()),
            tags: getPlanTags(previewPlan),
            secondaryText: getPlanDiscountText(previewPlan)
        };
    });

    const planItems: SelectItem[] = selectedIssuer.plans.map(plan => ({
        id: getPlanId(selectedIssuer, plan),
        name: getPlanLabel(plan),
        tags: getPlanTags(plan),
        secondaryText: getPlanDiscountText(plan)
    }));

    return (
        <fieldset className={styles.planSelection} aria-labelledby={labelledBy} aria-describedby={describedBy}>
            <Field name={'emiProvider'} label={i18n.get('emi.provider')}>
                <Select
                    name={'emiProvider'}
                    filterable={false}
                    items={issuerItems}
                    selectedValue={selectedIssuerId}
                    onChange={event => selectIssuer(String((event.target as SelectTargetObject).value))}
                />
            </Field>

            <Field name={'emiPlan'} label={i18n.get('emi.plan')}>
                <Select
                    // Remounted per issuer, so the list never keeps a highlighted plan that is gone
                    key={selectedIssuerId}
                    name={'emiPlan'}
                    filterable={false}
                    items={planItems}
                    selectedValue={selectedPlanId}
                    onChange={event => selectPlan(String((event.target as SelectTargetObject).value))}
                />
            </Field>
        </fieldset>
    );
}
