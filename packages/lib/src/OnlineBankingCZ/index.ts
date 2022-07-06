import IssuerListContainer from '../helpers/IssuerListContainer';

class EPSElement extends IssuerListContainer {
    public static type = 'onlinebanking_SK';

    formatProps(props) {
        return {
            ...super.formatProps(props),
            showImage: false
        };
    }
}

export default EPSElement;
