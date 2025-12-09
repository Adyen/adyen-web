import { h } from 'preact';

export interface SelectItem {
    disabled?: boolean;
    icon?: string;
    id: string | number;
    name: string;
    secondaryText?: string;
    selectedOptionName?: string;
}

export interface SelectTargetObject {
    value?: string | number;
    name?: string;
}

export interface SelectProps {
    className: string;
    classNameModifiers: string[];
    filterable: boolean;
    isInvalid?: boolean;
    isValid?: boolean;
    items: SelectItem[];
    name?: string;
    onChange: (
        e:
            | {
                  target: SelectTargetObject;
              }
            | Partial<h.JSX.TargetedKeyboardEvent<HTMLInputElement>>
    ) => void;
    onInput?: (value: string) => void;
    placeholder?: string;
    readonly: boolean;
    required?: boolean;
    selectedValue?: string | number;
    uniqueId?: string;
    disabled?: boolean;
    disableTextFilter?: boolean;
    clearOnSelect?: boolean;
    blurOnClose?: boolean;
    onListToggle?: (isOpen: boolean) => void;
    allowIdOnButton?: boolean;
}

export interface SelectButtonProps {
    inputText: string;
    active: SelectItem;
    selected: SelectItem;
    filterInputRef;
    filterable: boolean;
    isInvalid: boolean;
    isValid?: boolean;
    onButtonKeyDown: (e: KeyboardEvent) => void;
    onFocus: (e: Event) => void;
    onInput: (e: Event) => void;
    placeholder: string;
    readonly: boolean;
    required: boolean;
    selectListId: string;
    showList: boolean;
    toggleButtonRef;
    toggleList: (e: Event) => void;
    id?: string;
    ariaDescribedBy: string;
    disabled: boolean;
    allowIdOnButton?: boolean;
}

export interface SelectListProps {
    active: SelectItem;
    filteredItems: SelectItem[];
    onHover: (e: Event) => void;
    onSelect: (e: Event) => void;
    selected: SelectItem;
    selectListId: string;
    selectListRef;
    showList: boolean;
}

export interface SelectItemProps {
    active: boolean;
    item: SelectItem;
    selected: boolean;
    onHover: (e: Event) => void;
    onSelect: (e: Event) => void;
}
