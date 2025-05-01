import { InputBaseProps } from '../InputBase';

interface RadioGroupItem {
    name: string;
    id: string;
    imageURL: string;
    altName: string;
}

export interface RadioGroupProps extends InputBaseProps {
    className?: string;
    isInvalid?: boolean;
    items: RadioGroupItem[];
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
