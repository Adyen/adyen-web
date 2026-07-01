import { h, Ref, RefObject, HTMLAttributes, TargetedKeyboardEvent } from 'preact';

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
            | Partial<TargetedKeyboardEvent<HTMLInputElement>>
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
    additionalDescribedBy?: string;
}

export interface SelectButtonProps {
    inputText: string;
    active: SelectItem;
    selected: SelectItem;
    filterInputRef: RefObject<HTMLInputElement>;
    filterable: boolean;
    isInvalid: boolean;
    isValid?: boolean;
    onButtonKeyDown: (e: KeyboardEvent) => void;
    onFocus?: (e: Event) => void;
    onInput: (e: Event) => void;
    placeholder: string;
    readonly: boolean;
    required: boolean;
    selectListId: string;
    showList: boolean;
    toggleButtonRef: Ref<HTMLElement>;
    toggleList: (e: Event) => void;
    id?: string;
    ariaDescribedBy: string;
    disabled: boolean;
}

export interface SelectListProps {
    active: SelectItem;
    filteredItems: SelectItem[];
    onHover: (e: Event) => void;
    onSelect: (e: Event) => void;
    selected: SelectItem;
    selectListId: string;
    selectListRef: Ref<HTMLUListElement>;
    showList: boolean;
}

export interface SelectButtonElementProps extends Omit<HTMLAttributes<HTMLElement>, 'onClick' | 'onKeyDown'> {
    disabled: boolean;
    filterable: boolean;
    readonly?: boolean;
    selectListId: string;
    showList: boolean;
    toggleButtonRef: Ref<HTMLElement>;
    onClick: ((e: Event) => void) | null;
    onKeyDown: ((e: KeyboardEvent) => void) | null;
}

export interface SelectItemProps {
    active: boolean;
    item: SelectItem;
    selected: boolean;
    onHover: (e: Event) => void;
    onSelect: (e: Event) => void;
}
