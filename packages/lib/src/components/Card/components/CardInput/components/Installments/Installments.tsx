import { h } from 'preact';
import { useState, useEffect, useMemo } from 'preact/hooks';
import Field from '../../../../../internal/FormFields/Field';
import { useCoreContext } from '../../../../../../core/Context/CoreProvider';
import { InstallmentsItem } from '../types';
import Fieldset from '../../../../../internal/FormFields/Fieldset/Fieldset';
import RadioGroup from '../../../../../internal/FormFields/RadioGroup';
import Select from '../../../../../internal/FormFields/Select';
import { alternativeLabelContent } from '../FieldLabelAlternative';
import { useAmount } from '../../../../../../core/Context/AmountProvider';

import './Installments.scss';

export interface InstallmentsState {
    value: number;
    plan?: 'revolving' | 'bonus';
}

export interface InstallmentOption {
    values: number[];
    plans?: string[];
    preselectedValue?: number;
}

export interface InstallmentOptions {
    [key: string]: InstallmentOption;
}
export interface InstallmentsProps {
    brand?: string;
    onChange?: (installmentObject: object) => void;
    installmentOptions: InstallmentOptions;
    type?: string;
}

function createRadioGroupItems(installmentOption?: InstallmentOption, hasRadioButtonUI?: boolean): { id: string; name: string }[] {
    console.log('createRadioGroupItems executed');

    if (!hasRadioButtonUI) {
        return [];
    }

    return [
        { id: 'onetime', name: 'installments.oneTime' },
        { id: 'installments', name: 'installments.installments' },
        ...(installmentOption?.plans?.includes('revolving') ? [{ id: 'revolving', name: 'installments.revolving' }] : []),
        ...(installmentOption?.plans?.includes('bonus') ? [{ id: 'bonus', name: 'installments.bonus' }] : [])
    ];
}

function Installments(props: Readonly<InstallmentsProps>) {
    const { i18n } = useCoreContext();
    const { amount } = useAmount();
    const { brand, onChange, type } = props;
    const installmentOptions = props.installmentOptions[brand] || props.installmentOptions.card;
    const readOnly = installmentOptions?.values?.length === 1;
    const [installmentAmount, setInstallmentAmount] = useState(installmentOptions?.preselectedValue || installmentOptions?.values[0]);
    const [radioBtnValue, setRadioBtnValue] = useState('onetime');

    const hasRadioButtonUI = installmentOptions?.plans?.includes('revolving') || installmentOptions?.plans?.includes('bonus');
    const radioGroupItems = useMemo(() => createRadioGroupItems(installmentOptions, hasRadioButtonUI), [installmentOptions, hasRadioButtonUI]);

    const onSelectInstallment = e => {
        const selectedInstallments = e.target.value;
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
            const getPartialAmount = (divider: number): string => i18n.amount(amount.value / divider, amount.currency);

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
        if (installmentOptions?.values?.includes(installmentAmount)) {
            return;
        }

        setInstallmentAmount(installmentOptions?.preselectedValue ?? installmentOptions?.values[0]);
    }, [brand]);

    useEffect(() => {
        const state: InstallmentsState = {
            value: installmentAmount,
            ...(hasRadioButtonUI && radioBtnValue === 'onetime' && { value: 1 }),
            ...(hasRadioButtonUI && radioBtnValue === 'revolving' && { value: 1, plan: 'revolving' }),
            ...(hasRadioButtonUI && radioBtnValue === 'bonus' && { value: 1, plan: 'bonus' })
        };

        console.log('installments state', state);

        onChange(installmentOptions ? state : { value: null });
    }, [installmentAmount, installmentOptions, radioBtnValue]);

    if (!installmentOptions) return null;
    if (amount.value === 0) return null;

    if (hasRadioButtonUI) {
        return (
            <div className="adyen-checkout__installments adyen-checkout__installments--revolving-plan">
                <Field
                    label={i18n.get('installments')}
                    classNameModifiers={['installments']}
                    name={'installmentsPseudoLabel'}
                    useLabelElement={false}
                    showContextualElement={false}
                    renderAlternativeToLabel={alternativeLabelContent}
                >
                    <Fieldset classNameModifiers={['revolving-plan']} label={''}>
                        <RadioGroup items={radioGroupItems} onChange={onRadioSelect} value={radioBtnValue} ariaLabel={i18n.get('installments')} />

                        <Field
                            className={radioBtnValue !== 'installments' ? 'revolving-plan-installments__disabled' : 'revolving-plan-installments'}
                            classNameModifiers={['revolving-plan-installments']}
                            name={''}
                            useLabelElement={false}
                            showContextualElement={false}
                        >
                            <Select
                                filterable={false}
                                items={installmentOptions.values.map(installmentItemsMapper)}
                                selectedValue={installmentAmount}
                                onChange={onSelectInstallment}
                                name={'installments'}
                                disabled={radioBtnValue !== 'installments'}
                            />
                        </Field>
                    </Fieldset>
                </Field>
            </div>
        );
    }

    return (
        <div className="adyen-checkout__installments">
            <Field label={i18n.get('installments')} classNameModifiers={['installments']} name={'installments'} showContextualElement={false}>
                <Select
                    filterable={false}
                    items={installmentOptions.values.map(installmentItemsMapper)}
                    selectedValue={installmentAmount}
                    onChange={onSelectInstallment}
                    name={'installments'}
                    readonly={readOnly}
                    disabled={readOnly}
                />
            </Field>
        </div>
    );
}

Installments.defaultProps = {
    brand: '',
    onChange: () => {}
};

export default Installments;
