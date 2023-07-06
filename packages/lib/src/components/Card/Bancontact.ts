import { CardElement } from './Card';
import { CardElementProps } from './types';
import { CVC_POLICY_HIDDEN } from '../internal/SecuredFields/lib/configuration/constants';

class BancontactElement extends CardElement {
    public static type = 'bcmc';
    public static txVariants = ['bcmc'];

    constructor(props: CardElementProps) {
        super(props);
    }

    protected static defaultProps = {
        ...CardElement.defaultProps,
        brands: ['bcmc', 'maestro', 'visa']
    };

    /**
     * Now that the Bancontact (BCMC) Card component can accept a number dual branded with Visa (which requires a CVC) it has to be handled differently
     * at creation time (no automatic removing of the CVC securedField).
     * At the same time we can't treat it as a regular 'card' component - because it needs to hide the CVC field at at startup,
     * as well as show the BCMC logo in the number field and ignore any of the internal, regEx driven, brand detection.
     */
    formatProps(props: CardElementProps) {
        return {
            ...super.formatProps(props),
            type: 'bcmc', // Force type (only for the Dropin is type automatically set to 'bcmc') - this will bypass the regEx brand detection
            cvcPolicy: CVC_POLICY_HIDDEN
        };
    }

    // Disable internal event.emit() for Bancontact
    public onBrand = event => {
        if (this.props.onBrand) this.props.onBrand(event);
    };
}

export default BancontactElement;
