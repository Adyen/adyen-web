import RedirectElement from '../Redirect';

class VippsElement extends RedirectElement {
    public static type = 'vipps';

    public static defaultProps = {
        type: VippsElement.type,
        showPayButton: true,
        name: 'Vipps'
    };
}

export default VippsElement;
