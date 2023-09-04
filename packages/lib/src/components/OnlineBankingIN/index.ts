import IssuerListContainer from '../helpers/IssuerListContainer';
import collectBrowserInfo from '../../utils/browserInfo';
import { TxVariants } from '../tx-variants';

class OnlineBankingINElement extends IssuerListContainer {
    public static type = TxVariants.onlinebanking_IN;

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

export default OnlineBankingINElement;
