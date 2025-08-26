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

    const mandateText = useMemo((): string => {
        const { amount: mandateAmount, frequency, amountRule } = mandate;
        const { value: paymentAmount, currency } = amount || {};

        if (!currency) {
            console.warn('No mandate information because of missing currency');
            return '';
        }

        const formattedMandateAmount = i18n.amount(Number(mandateAmount), currency);
        const formattedTransactionAmount = paymentAmount ? i18n.amount(paymentAmount, currency) : null;

        const frequencyText = i18n.get(`upi.mandate.frequency.${frequency}`);

        if (amountRule === 'exact') {
            return i18n.get('upi.mandate.exact', { values: { amount: formattedMandateAmount, frequency: frequencyText } });
        }

        // rule === 'max'
        if (formattedTransactionAmount) {
            return i18n.get('upi.mandate.max.withAmount', {
                values: { amount: formattedTransactionAmount, mandateAmount: formattedMandateAmount, frequency: frequencyText }
            });
        }

        // rule === 'max' and no payment amount
        return i18n.get('upi.mandate.max.withoutAmount', { values: { mandateAmount: formattedMandateAmount, frequency: frequencyText } });
    }, [mandate, amount, i18n]);

    if (!mandateText) return null;

    return (
        <Alert icon="info" type="info">
            {i18n.get('upi.mandate.intro', { values: { mandateText } })}
        </Alert>
    );
};

export default UPIMandate;
