import { InputBaseProps } from '../InputBase';
import { CardBrandsConfiguration } from '../../../Card/types';

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
}

export interface RadioButtonIconProps {
    // brand: string;
    // brandsConfiguration: CardBrandsConfiguration;
    onClick?: any;
    dataValue?: string;
    notSelected?: boolean; // TODO - ??
    // onFocusField?: any;
    imageURL?: string;
    altName?: string;
}
