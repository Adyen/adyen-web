import { h } from 'preact';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { useAmount } from '../../../../core/Context/AmountProvider';
import { getLocalisedPercentageFromBasisPoints } from '../../../../utils/percentage-util';
import { selectDisplayOffer } from '../../utils';
import type { EmiPlan } from '../../types';
import type { PaymentAmount } from '../../../../types/global-types';
import styles from './EMIPlanSummary.module.scss';

interface EMIPlanSummaryProps {
    plan: EmiPlan;
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

export function EMIPlanSummary({ plan, labelledBy }: Readonly<EMIPlanSummaryProps>): h.JSX.Element {
    const { i18n } = useCoreContext();
    const { amount } = useAmount();
    const { monthlyPayableAmount, totalInterestAmount, totalPayableAmount } = plan.transactionAmounts;

    // The locale places the minus sign, the same way it places the currency symbol
    const formatAmount = ({ value, currency }: PaymentAmount, isNegative = false): string => i18n.amount(isNegative ? -value : value, currency);

    const candidateRows: CandidateRow[] = [
        { key: 'itemPrice', label: i18n.get('emi.itemPrice'), amount },
        { key: 'discount', label: i18n.get('emi.discount'), amount: selectDisplayOffer(plan.offers)?.amount, isNegative: true },
        { key: 'amountReservedOnCard', label: i18n.get('emi.amountReservedOnCard'), amount },
        {
            key: 'interest',
            label: i18n.get('emi.interestChargedByBank', {
                values: { interest: getLocalisedPercentageFromBasisPoints(plan.interestRateBps, i18n.locale) }
            }),
            amount: totalInterestAmount
        },
        { key: 'totalOverTime', label: i18n.get('emi.totalAmountOverTime'), amount: totalPayableAmount }
    ];

    /**
     * The plan always carries its own amounts, but the checkout amount is the merchant's: it is absent
     * when none was configured, and `null` reaches here in that case, which would throw on
     * destructuring. A plan without an offer has no discount row either.
     */
    const rows = candidateRows.filter((row): row is SummaryRow => row.amount != null);

    return (
        <fieldset className={styles.planSummary} aria-labelledby={labelledBy}>
            <dl className={styles.rows}>
                {rows.map(row => (
                    <div key={row.key} className={styles.row}>
                        <dt className={styles.rowLabel}>{row.label}</dt>
                        <dd className={styles.rowValue}>{formatAmount(row.amount, row.isNegative)}</dd>
                    </div>
                ))}
            </dl>

            <dl className={styles.monthlyPayment}>
                <dt className={styles.monthlyPaymentLabel}>{i18n.get('emi.upcomingMonthlyPayment')}</dt>
                <dd className={styles.monthlyPaymentValue}>{formatAmount(monthlyPayableAmount)}</dd>
            </dl>
        </fieldset>
    );
}
