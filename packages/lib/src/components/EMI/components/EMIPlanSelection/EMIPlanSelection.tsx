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
import { UiTarget } from '../../../../core/Analytics/events/AnalyticsInfoEvent';
import type { EmiIssuer, EmiOffer, EmiPlan, EmiPlanTypeKey, EmiSelection, EmiSelectTarget } from '../../types';
import type { PaymentAmount } from '../../../../types/global-types';
import type { SelectItem, SelectTargetObject } from '../../../internal/FormFields/Select/types';
import type { TagProps } from '../../../internal/Tag/types';
import styles from './EMIPlanSelection.module.scss';

interface EMIPlanSelectionProps {
    issuers: EmiIssuer[];
    selection: EmiSelection;
    onSelectionChange(selection: EmiSelection, target: EmiSelectTarget): void;
    labelledBy?: string;
    describedBy?: string;
}

const PLAN_TAGS: { type: EmiPlanTypeKey; translationKey: string; variant: TagVariant }[] = [
    { type: 'noCost', translationKey: 'emi.noCost', variant: TagVariant.SUCCESS },
    { type: 'lowCost', translationKey: 'emi.lowCost', variant: TagVariant.INFO }
];

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
        const issuer = issuers.find(candidate => getIssuerId(candidate) === id);
        if (!issuer) return;

        onSelectionChange({ issuer, plan: issuer.plans[0] }, UiTarget.emiProvider);
    };

    const selectPlan = (id: string) => {
        const plan = selectedIssuer.plans.find(candidate => getPlanId(selectedIssuer, candidate) === id);
        if (!plan) return;

        onSelectionChange({ issuer: selectedIssuer, plan }, UiTarget.emiPlan);
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

    const toTags = (types: EmiPlanTypeKey[]): TagProps[] | undefined => {
        const tags = PLAN_TAGS.filter(({ type }) => types.includes(type)).map(({ translationKey, variant }) => ({
            label: i18n.get(translationKey),
            variant
        }));

        return tags.length ? tags : undefined;
    };

    const getPlanTags = (plan: EmiPlan): TagProps[] | undefined => toTags([plan.type]);

    // Every tagged plan type the provider offers, so the tag advertises what is available at that bank
    // instead of tracking the selection. See ADR-0004-emi-plans-data-transformation for that rule.
    const getIssuerTags = (issuer: EmiIssuer): TagProps[] | undefined => toTags(issuer.plans.map(plan => plan.type));

    // The locale places the minus sign, the same way it places the currency symbol
    const formatDiscount = ({ value, currency }: PaymentAmount): string => i18n.amount(-value, currency);

    const getDiscountText = (offers?: EmiOffer[]): string | undefined => {
        const offer = selectDisplayOffer(offers);
        return offer ? `${formatDiscount(offer.amount)} ${i18n.get('emi.discountAvailable')}` : undefined;
    };

    const getPlanDiscountText = (plan: EmiPlan): string | undefined => getDiscountText(plan.offers);

    // The largest offer found anywhere among the provider's plans, provider-wide for the same reason
    // its tags are. See ADR-0004-emi-plans-data-transformation.
    const getIssuerDiscountText = (issuer: EmiIssuer): string | undefined => getDiscountText(issuer.plans.flatMap(plan => plan.offers ?? []));

    const getIssuerIcon = getIssuerImageUrl({ loadingContext }, TxVariants.emi, getImage);

    const issuerItems: SelectItem[] = issuers.map(issuer => ({
        id: getIssuerId(issuer),
        name: issuer.issuerName,
        icon: getIssuerIcon(issuer.issuerCode.toLowerCase()),
        tags: getIssuerTags(issuer),
        secondaryText: getIssuerDiscountText(issuer)
    }));

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
