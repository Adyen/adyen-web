import Language from '../../../../language/Language';

interface RadioGroupItem {
    name: string;
    id: string;
}

export interface RadioGroupProps {
    className?: string;
    isInvalid?: boolean;
    items: RadioGroupItem[];
    i18n: Language;
    name?: string;
    onChange: (e) => void;
    value?: string;
    uniqueId?: string;
}
