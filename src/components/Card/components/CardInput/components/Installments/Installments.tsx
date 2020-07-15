import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { renderFormField } from '../../../../../../components/internal/FormFields';
import Field from '../../../../../../components/internal/FormFields/Field';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import { PaymentAmount } from '../../../../../../types';

interface InstallmentOptions {
    [key: string]: {
        values: number[];
    };
}

interface InstallmentsProps {
    amount?: PaymentAmount;
    brand?: string;
    onChange?: (installmentAmount: number) => void;
    installmentOptions: InstallmentOptions;
}

interface InstallmentsItem {
    id: number;
    name: string;
}

/**
 * Installments generic dropdown
 */
function Installments(props: InstallmentsProps) {
    const { i18n } = useCoreContext();
    const { amount, brand, onChange } = props;
    const [installmentAmount, setInstallmentAmount] = useState(1);
    const installmentOptions = props.installmentOptions[brand] || props.installmentOptions.card;

    const getPartialAmount = (divider: number): string => i18n.amount(amount.value / divider, amount.currency);

    const onSelectInstallment = e => {
        const selectedInstallments = e.currentTarget.getAttribute('data-value');
        setInstallmentAmount(Number(selectedInstallments));
    };

    const installmentItemsMapper = (value: number): InstallmentsItem => ({
        id: value,
        name: amount.value
            ? i18n.get('installmentOption', { count: value, values: { times: value, partialValue: getPartialAmount(value) } })
            : `${value}`
    });

    useEffect(() => {
        const newAmount = installmentOptions && installmentOptions.values.includes(installmentAmount) ? installmentAmount : 1;
        setInstallmentAmount(newAmount);
    }, [brand]);

    useEffect(() => {
        onChange(installmentOptions ? installmentAmount : null);
    }, [installmentAmount, installmentOptions]);

    if (!installmentOptions) return null;
    if (amount.value === 0) return null;

    return (
        <div className="adyen-checkout__installments">
            <Field label={i18n.get('installments')} classNameModifiers={['installments']}>
                {renderFormField('select', {
                    items: installmentOptions.values.map(installmentItemsMapper),
                    selected: installmentAmount,
                    onChange: onSelectInstallment,
                    name: 'installments'
                })}
            </Field>
        </div>
    );
}

Installments.defaultProps = {
    brand: '',
    amount: {},
    onChange: () => {}
};

export default Installments;
