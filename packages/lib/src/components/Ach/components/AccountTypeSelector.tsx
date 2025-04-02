import Select from '../../internal/FormFields/Select';
import Field from '../../internal/FormFields/Field';
import { h } from 'preact';
import { useCallback, useMemo } from 'preact/hooks';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import { SelectItem } from '../../internal/FormFields/Select/types';

const SELECTOR_OPTIONS = [
    { id: 'personal.checking', nameKey: 'ach.bankAccount.option.personal-checking' },
    { id: 'personal.savings', nameKey: 'ach.bankAccount.option.personal-savings' },
    { id: 'business.checking', nameKey: 'ach.bankAccount.option.business-checking' },
    { id: 'business.savings', nameKey: 'ach.bankAccount.option.business-savings' }
];

interface AccountTypeSelectorProps {
    selectedAccountType?: string;
    onSelect(value: string): void;
    errorMessage?: string;
    placeholder?: string;
}

const AccountTypeSelector = ({ onSelect, selectedAccountType, errorMessage, placeholder }: AccountTypeSelectorProps) => {
    const { i18n } = useCoreContext();
    const options: SelectItem[] = useMemo(
        () =>
            SELECTOR_OPTIONS.map(option => ({
                id: option.id,
                name: i18n.get(option.nameKey)
            })),
        [i18n, SELECTOR_OPTIONS]
    );

    const onChange = useCallback(
        event => {
            const value = event.target.value;
            onSelect(value);
        },
        [onSelect]
    );

    return (
        <Field
            name={'ach-bankaccount-type'}
            useLabelElement={true}
            showContextualElement={false}
            label={i18n.get('ach.bankAccount.label')}
            errorMessage={errorMessage}
        >
            <Select
                placeholder={placeholder || i18n.get('ach.bankAccount.placeholder')}
                filterable={false}
                items={options}
                selectedValue={selectedAccountType}
                onChange={onChange}
                name={'ach-bankaccount-type'}
            />
        </Field>
    );
};

export { AccountTypeSelector };
