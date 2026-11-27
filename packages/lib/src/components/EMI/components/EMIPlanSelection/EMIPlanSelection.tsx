import { h } from 'preact';
import Field from '../../../internal/FormFields/Field';
import Select from '../../../internal/FormFields/Select';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import useImage from '../../../../core/Context/useImage';
import getIssuerImageUrl from '../../../../utils/get-issuer-image';
import { TxVariants } from '../../../tx-variants';
import { getPlanLabel, getPlanTags } from '../../utils';
import { UiTarget } from '../../../../core/Analytics/events/AnalyticsInfoEvent';
import type { EmiIssuer, EmiPlan, EmiSelection, EmiSelectTarget } from '../../types';
import type { PaymentAmount } from '../../../../types/global-types';
import type { SelectItem, SelectTargetObject } from '../../../internal/FormFields/Select/types';
import styles from './EMIPlanSelection.module.scss';

interface EMIPlanSelectionProps {
    issuers: EmiIssuer[];
    selection: EmiSelection;
    onSelectionChange(selection: EmiSelection, target: EmiSelectTarget): void;
    labelledBy?: string;
    describedBy?: string;
}

const toItemId = (prefix: string, segments: (string | number)[]): string =>
    [prefix, ...segments].map(segment => encodeURIComponent(segment)).join(':');

const getIssuerId = (issuer: EmiIssuer): string => toItemId('issuer', [issuer.issuerCode, issuer.fundingSource]);

const getPlanId = (issuer: EmiIssuer, plan: EmiPlan): string =>
    toItemId('plan', [issuer.issuerCode, issuer.fundingSource, plan.type, plan.tenureMonths]);

export function EMIPlanSelection({ issuers, selection, onSelectionChange, labelledBy, describedBy }: Readonly<EMIPlanSelectionProps>): h.JSX.Element {
    const { i18n } = useCoreContext();
    const getImage = useImage();

    const { issuer: selectedIssuer, plan: selectedPlan } = selection;

    const selectedIssuerId = getIssuerId(selectedIssuer);
    const selectedPlanId = getPlanId(selectedIssuer, selectedPlan);

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

    const getDiscountText = (discount?: PaymentAmount): string | undefined =>
        discount ? i18n.get('emi.additionalDiscountAvailable', { values: { amount: i18n.amount(discount.value, discount.currency) } }) : undefined;

    const getIssuerIcon = getIssuerImageUrl({}, TxVariants.emi, getImage);

    const issuerItems: SelectItem[] = issuers.map(issuer => ({
        id: getIssuerId(issuer),
        name: issuer.issuerName,
        icon: getIssuerIcon(issuer.issuerCode.toLowerCase()),
        tags: getPlanTags(issuer.availablePlanTypes, i18n),
        secondaryText: getDiscountText(issuer.bestOffer)
    }));

    const planItems: SelectItem[] = selectedIssuer.plans.map(plan => ({
        id: getPlanId(selectedIssuer, plan),
        name: getPlanLabel(plan, i18n),
        tags: getPlanTags([plan.type], i18n),
        secondaryText: getDiscountText(plan.transactionAmounts.totalInstantDiscountAmount)
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
