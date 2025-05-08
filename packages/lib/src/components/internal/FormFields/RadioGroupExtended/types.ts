import { InputBaseProps } from '../InputBase';

interface RadioGroupExtendedItem {
    name: string;
    id: string;
    imageURL: string;
    altName: string;
}

export interface RadioGroupExtendedProps extends InputBaseProps {
    className?: string;
    isInvalid?: boolean;
    items: RadioGroupExtendedItem[];
    name?: string;
    onChange: (e) => void;
    value?: string;
    uniqueId?: string;
    ariaLabel?: string;
    style?: 'classic' | 'button';
    showRadioIcon?: boolean;
    showSelectedTick?: boolean;
}

export interface RadioButtonIconProps {
    onClick?: any;
    dataValue?: string;
    imageURL?: string;
    altName?: string;
    showRadioIcon?: boolean;
}
