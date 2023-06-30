interface RadioGroupItem {
    name: string;
    id: string;
}

export interface RadioGroupProps {
    className?: string;
    isInvalid?: boolean;
    items: RadioGroupItem[];
    name?: string;
    onChange: (e) => void;
    value?: string;
    uniqueId?: string;
}
