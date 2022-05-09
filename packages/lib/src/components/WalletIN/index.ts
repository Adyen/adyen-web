import IssuerListContainer from '../helpers/IssuerListContainer';

class WalletINElement extends IssuerListContainer {
    public static type = 'wallet_IN';

    formatProps(props) {
        return {
            ...super.formatProps(props),
            showImage: false
        };
    }
}

export default WalletINElement;
