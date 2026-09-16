import { Fragment, h } from 'preact';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { useAmount } from '../../../../core/Context/AmountProvider';
import { getLocalisedPercentageFromBasisPoints } from '../../../../utils/percentage-util';
import { selectDisplayOffer } from '../../utils';
import type { EmiPlan, EmiPlanTypeKey } from '../../types';
import type { PaymentAmount } from '../../../../types/global-types';
import styles from './EMIPlanSummary.module.scss';

interface EMIPlanSummaryProps {
    plan: EmiPlan;
    labelledBy?: string;
}

interface SummaryRow {
    key: string;
    label: string;
    amount: PaymentAmount;
    /** The amount before the offer, struck through ahead of the discounted `amount`. */
    originalAmount?: PaymentAmount;
    isNegative?: boolean;
}

type CandidateRow = Omit<SummaryRow, 'amount'> & { amount?: PaymentAmount };

/**
 * These plan types spend their offer on the interest the bank charges, so it is shown discounting the
 * interest and the reserved amount instead of as a discount row of its own, which would count it twice.
 */
const OFFER_DISCOUNTS_INTEREST: EmiPlanTypeKey[] = ['noCost', 'lowCost'];

export function EMIPlanSummary({ plan, labelledBy }: Readonly<EMIPlanSummaryProps>): h.JSX.Element {
    const { i18n } = useCoreContext();
    const { amount } = useAmount();
    const { monthlyPayableAmount, totalInterestAmount, totalPayableAmount } = plan.transactionAmounts;

    const offer = selectDisplayOffer(plan.offers)?.amount;
    const discountsInterest = offer != null && OFFER_DISCOUNTS_INTEREST.includes(plan.type);

    const discount = discountsInterest ? offer.value : 0;

    // An offer larger than what it discounts leaves nothing to pay, rather than an amount owed to the shopper
    const applyDiscount = ({ value, currency }: PaymentAmount): PaymentAmount => ({ value: Math.max(value - discount, 0), currency });

    // The locale places the minus sign, the same way it places the currency symbol
    const formatAmount = ({ value, currency }: PaymentAmount, isNegative = false): string => i18n.amount(isNegative ? -value : value, currency);

    const authAmount = discountsInterest && amount ? applyDiscount(amount) : amount;

    const interestRow: CandidateRow = {
        key: 'interest',
        label: i18n.get('emi.interestChargedByBank', {
            values: { interest: getLocalisedPercentageFromBasisPoints(plan.interestRateBps, i18n.locale) }
        }),
        ...(discountsInterest && totalInterestAmount
            ? { amount: applyDiscount(totalInterestAmount), originalAmount: totalInterestAmount }
            : { amount: totalInterestAmount })
    };

    const candidateRows: CandidateRow[] = [
        { key: 'itemPrice', label: i18n.get('emi.itemPrice'), amount },
        { key: 'discount', label: i18n.get('emi.discount'), amount: discountsInterest ? undefined : offer, isNegative: true },
        { key: 'amountReservedOnCard', label: i18n.get('emi.amountReservedOnCard'), amount: authAmount },
        interestRow,
        { key: 'totalOverTime', label: i18n.get('emi.totalAmountOverTime'), amount: totalPayableAmount }
    ];

    /**
     * The checkout amount is the merchant's, so `null` reaches here when none was configured, and no
     * discount row is rendered for a plan without an offer or for one discounting its interest with it.
     */
    const rows = candidateRows.filter((row): row is SummaryRow => row.amount != null);

    return (
        <fieldset className={styles.planSummary} aria-labelledby={labelledBy}>
            <dl className={styles.rows}>
                {rows.map(row => (
                    <div key={row.key} className={styles.row}>
                        <dt className={styles.rowLabel}>{row.label}</dt>
                        <dd className={styles.rowValue}>
                            {row.originalAmount ? (
                                <Fragment>
                                    {/* The row announces the amount the shopper pays, and the strikethrough carries the discount visually */}
                                    <s className={styles.rowValueOriginal} aria-hidden={'true'}>
                                        {formatAmount(row.originalAmount)}
                                    </s>
                                    <span className={styles.rowValueDiscounted}>{formatAmount(row.amount)}</span>
                                </Fragment>
                            ) : (
                                formatAmount(row.amount, row.isNegative)
                            )}
                        </dd>
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
