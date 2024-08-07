import { CardElement } from './Card';
import { CardElementData, CardConfiguration } from './types';
import { CVC_POLICY_HIDDEN } from '../internal/SecuredFields/lib/constants';
import { TxVariants } from '../tx-variants';
import type { ICore } from '../../core/types';

class BancontactElement extends CardElement {
    public static type = TxVariants.bcmc;

    constructor(checkout: ICore, props?: CardConfiguration) {
        super(checkout, props);
    }

    protected static defaultProps = {
        ...CardElement.defaultProps,
        brands: ['bcmc', 'maestro', 'visa']
    };

    formatData(): CardElementData {
        const data = super.formatData();
        data.paymentMethod.type = this.constructor['type'];
        return data;
    }

    /**
     * Now that the Bancontact (BCMC) Card component can accept a number dual branded with Visa (which requires a CVC) it has to be handled differently
     * at creation time (no automatic removing of the CVC securedField).
     * At the same time we can't treat it as a regular 'card' component - because it needs to hide the CVC field at at startup,
     * as well as show the BCMC logo in the number field and ignore any of the internal, regEx driven, brand detection.
     */
    formatProps(props: CardConfiguration) {
        return {
            ...super.formatProps(props),
            /**
             * Force type (only for the Dropin is type automatically set to 'bcmc')
             * - this will bypass the regEx brand detection that SF normally tries to carry out when the first few digits are entered in the PAN
             */
            type: TxVariants.bcmc,
            brand: TxVariants.bcmc,
            cvcPolicy: CVC_POLICY_HIDDEN
        };
    }

    // Disable internal event.emit() for Bancontact
    public onBrand = event => {
        if (this.props.onBrand) this.props.onBrand(event);
    };
}

export default BancontactElement;
