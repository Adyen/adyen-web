export interface SelectItem {
    disabled?: boolean;
    icon?: string;
    id: string | number;
    name: string;
    secondaryText?: string;
    selectedOptionName?: string;
}

export interface SelectProps {
    className: string;
    classNameModifiers: string[];
    filterable: boolean;
    isInvalid: boolean;
    isValid?: boolean;
    items: SelectItem[];
    name?: string;
    onChange: (e: { target: { value: string | number; name: string } }) => void;
    placeholder: string;
    readonly: boolean;
    selected: string;
    uniqueId?: string;
    isCollatingErrors: boolean;
    disabled: boolean;
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
    selectListId: string;
    showList: boolean;
    toggleButtonRef;
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
