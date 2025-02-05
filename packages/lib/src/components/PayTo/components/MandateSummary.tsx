import DetailsTable from '../../internal/DetailsTable';
import { h } from 'preact';
import { MandateType } from '../types';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import { DetailsTableData } from '../../internal/DetailsTable/DetailsTable';
import './MandateSummary.scss';

export default function MandateSummary({ mandate, currencyCode }: { mandate: MandateType; currencyCode: string }) {
    const { i18n } = useCoreContext();
    const tableFields: DetailsTableData = Object.keys(mandate).map((key: keyof MandateType) => {
        // get the label for the key, like payto.mandate.amount.label, payto.mandate.frequency.label
        const labelText = i18n.get(`payto.mandate.${key}.label`);
        const amountValue = Number(mandate['amount']);
        switch (key) {
            case 'amount': {
                // it can be either show "amount" OR "amount up to (max amount)"
                const formatedAmount = i18n.amount(amountValue, currencyCode);
                if (mandate.amountRule === 'max') {
                    return {
                        label: labelText,
                        value: i18n.get('payto.mandate.amount.max', { values: { amount: formatedAmount } })
                    };
                } else {
                    return {
                        label: labelText,
                        value: i18n.amount(amountValue, currencyCode)
                    };
                }
            }
            case 'frequency': {
                if (!mandate.count) {
                    // if there's no count we just say 'adhoc'
                    return {
                        label: labelText,
                        value: i18n.get(`payto.mandate.frequency.adhoc-no-count`)
                    };
                } else {
                    // frequency can be: adhoc, daily, weekly, biWeekly, monthly, quarterly, halfYearly, yearly
                    return {
                        label: labelText,
                        value: i18n.get(`payto.mandate.frequency.${mandate.frequency}`, { values: { count: mandate.count } })
                    };
                }
            }
            // TODO test this for XSS
            case 'remarks':
                return {
                    label: labelText,
                    value: mandate.remarks
                };
            case 'startsAt':
                return {
                    label: labelText,
                    value: i18n.date(mandate.startsAt)
                };

            case 'endsAt':
                return {
                    label: labelText,
                    value: i18n.date(mandate.endsAt)
                };
        }
    });

    return <DetailsTable tableFields={tableFields}></DetailsTable>;
}
