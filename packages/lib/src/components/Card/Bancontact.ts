import { CardElement } from './Card';
import { CardElementProps } from './types';

class BancontactElement extends CardElement {
    constructor(props: CardElementProps) {
        super(props);
    }

    formatProps(props: CardElementProps) {
        return {
            brand: 'bcmc',
            ...super.formatProps(props),
            // Override only display brands (groupTypes are decided earlier on super.formatProps)
            brands: ['bcmc', 'maestro']
        };
    }

    // Disable internal event.emit() for Bancontact
    public onBrand = event => {
        if (this.props.onBrand) this.props.onBrand(event);
    };
}

export default BancontactElement;
