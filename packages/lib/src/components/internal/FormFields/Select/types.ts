export interface SelectItem {
    disabled?: boolean;
    icon?: string;
    id: string;
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
    onChange: (e) => void;
    placeholder: string;
    readonly: boolean;
    selected: string;
    uniqueId?: string;
    isCollatingErrors: boolean;
}

export interface SelectButtonProps {
    active: SelectItem;
    filterInputRef;
    filterable: boolean;
    isInvalid: boolean;
    isValid?: boolean;
    onButtonKeyDown: (e: KeyboardEvent) => void;
    onInput: (e: Event) => void;
    placeholder: string;
    readonly: boolean;
    selectListId: string;
    showList: boolean;
    toggleButtonRef;
    toggleList: (e: Event) => void;
    id?: string;
    ariaDescribedBy: string;
}

export interface SelectListProps {
    active: SelectItem;
    items: SelectItem[];
    onKeyDown: (e: KeyboardEvent) => void;
    onSelect: (e: Event) => void;
    selectListId: string;
    selectListRef;
    showList: boolean;
    textFilter: string;
}

export interface SelectItemProps {
    item: SelectItem;
    selected: boolean;
    onKeyDown: (e: KeyboardEvent) => void;
    onSelect: (e: Event) => void;
}
