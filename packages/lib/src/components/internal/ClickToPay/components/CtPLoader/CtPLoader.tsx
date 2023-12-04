import { Fragment, h } from 'preact';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import './CtPLoader.scss';

const CtPLoader = (): h.JSX.Element => {
    const { i18n } = useCoreContext();

    return (
        <Fragment>
            <div className="adyen-checkout-ctp__card-animation">
                <div className="adyen-checkout-ctp__card-animation-layer"></div>
                <div className="adyen-checkout-ctp__card-animation-layer"></div>
                <div className="adyen-checkout-ctp__card-animation-layer"></div>
            </div>

            <div className="adyen-checkout-ctp__loading-subtitle">{i18n.get('ctp.loading.intro')}</div>
        </Fragment>
    );
};

export default CtPLoader;
