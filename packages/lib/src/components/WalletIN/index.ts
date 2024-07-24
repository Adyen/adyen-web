import IssuerListContainer from '../helpers/IssuerListContainer/IssuerListContainer';
import collectBrowserInfo from '../../utils/browserInfo';
import { TxVariants } from '../tx-variants';

class WalletINElement extends IssuerListContainer {
    public static type = TxVariants.wallet_IN;

    formatProps(props) {
        return {
            ...super.formatProps(props),
            showImage: false
        };
    }

    /**
     * Formats the component data output
     */
    formatData() {
        return {
            ...super.formatData(),
            browserInfo: this.browserInfo
        };
    }

    get browserInfo() {
        return collectBrowserInfo();
    }
}

export default WalletINElement;
