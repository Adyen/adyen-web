import { h } from 'preact';
import cx from 'classnames';
import { Tag } from '../../../internal/Tag';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { useAmount } from '../../../../core/Context/AmountProvider';
import { getLocalisedPercentageFromBasisPoints } from '../../../../utils/percentage-util';
import { selectDisplayOffer } from '../../utils';
import { INTEREST_DISCOUNT_PLAN_TYPES, PLAN_TAGS } from '../../constants';
import type { EmiPlan } from '../../types';
import type { PaymentAmount } from '../../../../types/global-types';
import type { TagProps } from '../../../internal/Tag/types';
import styles from './EMIPlanSummary.module.scss';

interface EMIPlanSummaryProps {
    plan: EmiPlan;
    labelledBy?: string;
}

interface SummaryRow {
    key: string;
    label: string;
    amount: PaymentAmount;
    /** Names the plan type the discount comes with, alongside the label of the row it discounts. */
    tag?: TagProps;
    isNegative?: boolean;
    /** The two figures the design emphasises: what the card is charged now, and what the plan costs in total. */
    isStrong?: boolean;
}

type CandidateRow = Omit<SummaryRow, 'amount'> & { amount?: PaymentAmount };

export function EMIPlanSummary({ plan, labelledBy }: Readonly<EMIPlanSummaryProps>): h.JSX.Element {
    const { i18n } = useCoreContext();
    const { amount } = useAmount();
    const { instantDiscountAmount, totalInterestAmount, totalPayableAmount } = plan.transactionAmounts;

    const offer = selectDisplayOffer(plan.offers)?.amount;
    const interestDiscount = offer && INTEREST_DISCOUNT_PLAN_TYPES.includes(plan.type) ? offer : undefined;
    const planTag = PLAN_TAGS.find(({ type }) => type === plan.type);

    // The locale places the minus sign, the same way it places the currency symbol
    const formatAmount = ({ value, currency }: PaymentAmount, isNegative = false): string => i18n.amount(isNegative ? -value : value, currency);

    // Both discounts come off the authorisation, and discounts larger than it leave nothing to reserve
    const reserved = (interestDiscount?.value ?? 0) + (instantDiscountAmount?.value ?? 0);
    const authAmount = amount ? { ...amount, value: Math.max(amount.value - reserved, 0) } : amount;
    const interestLabel = `${i18n.get('emi.interestChargedByBank', {
        values: { interest: getLocalisedPercentageFromBasisPoints(plan.interestRateBps, i18n.locale) }
    })} ${i18n.get('emi.perAnnum')}`;

    const candidateRows: CandidateRow[] = [
        { key: 'itemPrice', label: i18n.get('emi.itemPrice'), amount },
        { key: 'instantDiscount', label: i18n.get('emi.instantDiscount'), amount: instantDiscountAmount, isNegative: true },
        {
            key: 'interestDiscount',
            label: i18n.get('emi.discount'),
            amount: interestDiscount,
            isNegative: true,
            ...(planTag && { tag: { label: i18n.get(planTag.translationKey), variant: planTag.variant } })
        },
        { key: 'amountReservedOnCard', label: i18n.get('emi.amountReservedOnCard'), amount: authAmount, isStrong: true },
        {
            key: 'interest',
            label: interestLabel,
            amount: totalInterestAmount
        },
        { key: 'totalOverTime', label: i18n.get('emi.totalAmountOverTime'), amount: totalPayableAmount, isStrong: true }
    ];

    /**
     * The checkout amount is the merchant's, so `null` reaches here when none was configured, and a discount
     * row is dropped for a plan that carries neither an instant discount nor an offer buying its interest down.
     */
    const rows = candidateRows.filter((row): row is SummaryRow => row.amount != null);

    return (
        <fieldset className={styles.planSummary} aria-labelledby={labelledBy}>
            <dl className={styles.rows}>
                {rows.map(row => (
                    <div key={row.key} className={cx(styles.row, { [styles.rowStrong]: row.isStrong })}>
                        <dt className={styles.rowLabel}>
                            {row.label}
                            {row.tag && <Tag label={row.tag.label} variant={row.tag.variant} />}
                        </dt>
                        <dd className={cx(styles.rowValue, { [styles.rowValueDiscount]: row.isNegative })}>
                            {formatAmount(row.amount, row.isNegative)}
                        </dd>
                    </div>
                ))}
            </dl>
        </fieldset>
    );
}
