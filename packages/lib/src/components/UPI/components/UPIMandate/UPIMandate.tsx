import { h } from 'preact';
import { useMemo } from 'preact/hooks';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import Alert from '../../../internal/Alert';
import type { PaymentAmount } from '../../../../types/global-types';

export interface Mandate {
    /**
     * Mandate amount in the smallest unit of the currency. Maximum amount the shopper authorizes
     * for future recurring charges.
     */
    amount: string;
    /**
     * Charge cadence for the mandate.
     */
    frequency: 'monthly' | 'weekly' | 'adhoc';
    /**
     * - `max`: merchant can charge any amount up to `amount` during future billing cycles.
     * - `exact`: merchant must charge exactly `amount` on each recurring charge.
     */
    amountRule: 'max' | 'exact';
    /**
     * End date of the mandate in `YYYY-MM-DD` format. Required by the Checkout API.
     * Recommended to set between 7 and 10 years in the future.
     */
    endsAt: string;
    /**
     * Start date of the mandate in `YYYY-MM-DD` format. Defaults to the mandate creation date.
     */
    startsAt?: string;
    /**
     * Free-form description of the mandate shown on the shopper's UPI app.
     */
    remarks?: string;
}

export interface UPIMandateProps {
    mandate: Mandate;
    amount?: PaymentAmount;
}

const UPIMandate = ({ mandate, amount }: Readonly<UPIMandateProps>): h.JSX.Element => {
    const { i18n } = useCoreContext();

    const mandateContent = useMemo((): h.JSX.Element => {
        const { amount: mandateAmount, frequency, amountRule } = mandate;
        const { value: paymentAmount, currency } = amount || {};

        if (!frequency || !amountRule || !mandateAmount || !currency) {
            console.warn('No mandate information because of missing one of the following: frequency, amountRule, amount or currency');
            return null;
        }

        const formattedMandateAmount = i18n.amount(Number(mandateAmount), currency);
        const formattedTransactionAmount = paymentAmount ? i18n.amount(paymentAmount, currency) : null;

        const frequencyText = i18n.get(`upi.mandate.frequency.${frequency}`);
        const introText = i18n.get('upi.mandate.intro');
        const recurringAmount = `${formattedMandateAmount}${frequencyText}`;

        if (amountRule === 'exact') {
            return (
                <span>
                    {introText} (<strong>{recurringAmount}</strong>).
                </span>
            );
        }

        // amountRule === 'max'
        const maxAmountText = i18n.get('upi.mandate.upTo', { values: { amount: recurringAmount } });

        if (formattedTransactionAmount) {
            const extraText = i18n.get('upi.mandate.max.extraText');
            return (
                <span>
                    {introText} (<strong>{formattedTransactionAmount}</strong>). {extraText} (<strong>{maxAmountText}</strong>).
                </span>
            );
        }

        return (
            <span>
                {introText} (<strong>{maxAmountText}</strong>).
            </span>
        );
    }, [mandate, amount, i18n]);

    if (!mandateContent) return null;

    return (
        <Alert icon="info_black" type="info">
            {mandateContent}
        </Alert>
    );
};

export default UPIMandate;
