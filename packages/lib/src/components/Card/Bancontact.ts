import { CardElement } from './Card';
import { CardElementProps } from './types';

class BancontactElement extends CardElement {
    constructor(props: CardElementProps) {
        super(props);
    }

    formatProps(props: CardElementProps) {
        return {
            ...super.formatProps({ ...props, brand: 'bcmc' }), // Spread props and set brand before passing to super - ensures super.hasCVC gets set to false
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
