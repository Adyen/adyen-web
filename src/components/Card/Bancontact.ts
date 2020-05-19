import { CardElement, CardElementProps } from './Card';
import withPayButton from '~/components/helpers/withPayButton';

class BancontactElement extends CardElement {
    constructor(props: CardElementProps) {
        super(props);
    }

    formatProps(props: CardElementProps) {
        return {
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

export default withPayButton(BancontactElement);
