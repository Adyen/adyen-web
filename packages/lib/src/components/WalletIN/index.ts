import IssuerListContainer from '../helpers/IssuerListContainer';
import collectBrowserInfo from '../../utils/browserInfo';

class WalletINElement extends IssuerListContainer {
    public static type = 'wallet_IN';

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
