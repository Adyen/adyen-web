import { h } from 'preact';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { useAmount } from '../../../../core/Context/AmountProvider';
import { getLocalisedPercentageFromBasisPoints } from '../../../../utils/percentage-util';
import type { EmiPlanOption } from '../../types';
import type { PaymentAmount } from '../../../../types/global-types';
import styles from './EMIPlanSummary.module.scss';

interface EMIPlanSummaryProps {
    plan: EmiPlanOption;
    /** Id of the heading naming this section. */
    labelledBy?: string;
}

interface SummaryRow {
    key: string;
    label: string;
    amount: PaymentAmount;
    isNegative?: boolean;
}

type CandidateRow = Omit<SummaryRow, 'amount'> & { amount?: PaymentAmount };

export function EMIPlanSummary({ plan, labelledBy }: Readonly<EMIPlanSummaryProps>): h.JSX.Element | null {
    const { i18n } = useCoreContext();
    const { amount } = useAmount();

    // The locale places the minus sign, the same way it places the currency symbol
    const formatAmount = ({ value, currency }: PaymentAmount, isNegative = false): string => i18n.amount(isNegative ? -value : value, currency);

    const candidateRows: CandidateRow[] = [
        { key: 'itemPrice', label: i18n.get('emi.itemPrice'), amount },
        { key: 'discount', label: i18n.get('emi.discount'), amount: plan.selectedOffer?.amount, isNegative: true },
        { key: 'amountReservedOnCard', label: i18n.get('emi.amountReservedOnCard'), amount },
        {
            key: 'interest',
            label: i18n.get('emi.interestChargedByBank', {
                values: { interest: getLocalisedPercentageFromBasisPoints(plan.interestRateBps, i18n.locale) }
            }),
            amount: plan.totalInterestAmount
        },
        { key: 'totalOverTime', label: i18n.get('emi.totalAmountOverTime'), amount: plan.totalPayableAmount }
    ];

    const rows = candidateRows.filter((row): row is SummaryRow => row.amount !== undefined);

    if (rows.length === 0 && !plan.monthlyPayableAmount) return null;

    return (
        <div className={styles.planSummary} role={'group'} aria-labelledby={labelledBy}>
            {rows.length > 0 && (
                <dl className={styles.rows}>
                    {rows.map(row => (
                        <div key={row.key} className={styles.row}>
                            <dt className={styles.rowLabel}>{row.label}</dt>
                            <dd className={styles.rowValue}>{formatAmount(row.amount, row.isNegative)}</dd>
                        </div>
                    ))}
                </dl>
            )}

            {plan.monthlyPayableAmount && (
                <dl className={styles.monthlyPayment}>
                    <dt className={styles.monthlyPaymentLabel}>{i18n.get('emi.upcomingMonthlyPayment')}</dt>
                    <dd className={styles.monthlyPaymentValue}>{formatAmount(plan.monthlyPayableAmount)}</dd>
                </dl>
            )}
        </div>
    );
}
