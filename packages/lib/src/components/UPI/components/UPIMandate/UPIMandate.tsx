import { h } from 'preact';
import { useMemo } from 'preact/hooks';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import Alert from '../../../internal/Alert';
import type { PaymentAmount } from '../../../../types/global-types';

export type Mandate = { amount: string; frequency: 'monthly' | 'weekly' | 'adhoc'; amountRule: 'max' | 'exact' };

export interface UPIMandateProps {
    mandate: Mandate;
    amount?: PaymentAmount;
}

const UPIMandate = ({ mandate, amount }: UPIMandateProps): h.JSX.Element => {
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
