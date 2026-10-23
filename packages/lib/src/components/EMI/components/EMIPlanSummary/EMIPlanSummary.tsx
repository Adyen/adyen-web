import { h } from 'preact';
import cx from 'classnames';
import { Tag } from '../../../internal/Tag';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { useAmount } from '../../../../core/Context/AmountProvider';
import { formatInterestRate, getPlanTags } from '../../utils';
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
    tag?: TagProps;
    isNegative?: boolean;
    isStrong?: boolean;
}

type CandidateRow = Omit<SummaryRow, 'amount'> & { amount?: PaymentAmount };

export function EMIPlanSummary({ plan, labelledBy }: Readonly<EMIPlanSummaryProps>): h.JSX.Element {
    const { i18n } = useCoreContext();
    const { amount } = useAmount();
    const { authorizationAmount, additionalDiscountAmount, interestDiscountAmount, totalInterestAmount, totalPayableAmount } =
        plan.transactionAmounts;
    const planTag = getPlanTags([plan.type], i18n)?.[0];

    const formatAmount = ({ value, currency }: PaymentAmount, isNegative = false): string => i18n.amount(isNegative ? -value : value, currency);

    const interestLabel = i18n.get('emi.interestChargedByBank', { values: { interest: formatInterestRate(plan.interestRateBps, i18n) } });

    const candidateRows: CandidateRow[] = [
        { key: 'itemPrice', label: i18n.get('emi.itemPrice'), amount },
        { key: 'instantDiscount', label: i18n.get('emi.instantDiscount'), amount: additionalDiscountAmount, isNegative: true },
        {
            key: 'interestDiscount',
            label: i18n.get('emi.interestDiscount'),
            amount: interestDiscountAmount,
            isNegative: true,
            ...(planTag && { tag: planTag })
        },
        { key: 'amountReservedOnCard', label: i18n.get('emi.amountReservedOnCard'), amount: authorizationAmount, isStrong: true },
        {
            key: 'interest',
            label: interestLabel,
            amount: totalInterestAmount
        },
        { key: 'totalOverTime', label: i18n.get('emi.totalAmountOverTime'), amount: totalPayableAmount, isStrong: true }
    ];

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
