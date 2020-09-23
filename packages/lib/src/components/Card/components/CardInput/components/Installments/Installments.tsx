import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { renderFormField } from '../../../../../internal/FormFields';
import Field from '../../../../../internal/FormFields/Field';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import { InstallmentsItem, InstallmentsProps } from '../types';
import Fieldset from '../../../../../internal/FormFields/Fieldset/Fieldset';
import RadioGroup from '../../../../../internal/FormFields/RadioGroup';
import styles from '../../CardInput.module.scss';

/**
 * Installments generic dropdown
 */
function Installments(props: InstallmentsProps) {
    const { i18n } = useCoreContext();

    const { amount, brand, onChange, type } = props;
    const [installmentAmount, setInstallmentAmount] = useState(1);
    const [radioBtnValue, setRadioBtnValue] = useState('onetime');

    const installmentOptions = props.installmentOptions[brand] || props.installmentOptions.card;

    // hasRadioButtonUI determines if we have 3 radio buttons in the UI ('onetime', 'installments' and 'revolving')
    const hasRadioButtonUI = installmentOptions?.plans?.includes('revolving');

    const getPartialAmount = (divider: number): string => i18n.amount(amount.value / divider, amount.currency);

    const onSelectInstallment = e => {
        const selectedInstallments = e.currentTarget.getAttribute('data-value');
        setInstallmentAmount(Number(selectedInstallments));
    };

    const onRadioSelect = e => {
        const selectedBtn = e.currentTarget.getAttribute('value');
        setRadioBtnValue(selectedBtn);
    };

    const installmentItemsMapper = (value: number): InstallmentsItem => {
        let translationKey;
        let translationObj;

        if (type === 'amount') {
            translationKey = 'installmentOption';
            translationObj = { count: value, values: { times: value, partialValue: getPartialAmount(value) } };
        } else {
            translationKey = `installmentOptionMonths`;
            translationObj = { count: value, values: { times: value } };
        }

        return {
            id: value,
            name: amount.value ? i18n.get(translationKey, translationObj) : `${value}`
        };
    };

    useEffect(() => {
        const newAmount = installmentOptions && installmentOptions.values.includes(installmentAmount) ? installmentAmount : 1;
        setInstallmentAmount(newAmount);
    }, [brand]);

    useEffect(() => {
        const stateObj: any = {
            value: installmentAmount, // No radio button interface or "installments" radio button selected
            ...(hasRadioButtonUI && radioBtnValue === 'revolving' && { plan: radioBtnValue, value: 1 }),
            ...(hasRadioButtonUI && radioBtnValue === 'onetime' && { value: 1 })
        };

        onChange(installmentOptions ? stateObj : { value: null });
    }, [installmentAmount, installmentOptions, radioBtnValue]);

    if (!installmentOptions) return null;
    if (amount.value === 0) return null;

    // Alternate interface for installments with the possibility of a "revolving" plan
    if (hasRadioButtonUI) {
        return (
            <div className="adyen-checkout__installments">
                <Fieldset classNameModifiers={['revolving-plan']} label={''}>
                    <RadioGroup
                        items={[
                            { id: 'onetime', name: 'installments.oneTime' },
                            { id: 'installments', name: 'installments.installments' },
                            { id: 'revolving', name: 'installments.revolving' }
                        ]}
                        i18n={i18n}
                        onChange={onRadioSelect}
                        value={radioBtnValue}
                    />

                    <Field
                        className={
                            radioBtnValue !== 'installments'
                                ? `${styles['revolving-plan-installments__disabled']}`
                                : `${styles['revolving-plan-installments']}`
                        }
                        classNameModifiers={['revolving-plan-installments']}
                    >
                        {renderFormField('select', {
                            items: installmentOptions.values.map(installmentItemsMapper),
                            selected: installmentAmount,
                            onChange: onSelectInstallment,
                            name: 'installments'
                        })}
                    </Field>
                </Fieldset>
            </div>
        );
    }

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
