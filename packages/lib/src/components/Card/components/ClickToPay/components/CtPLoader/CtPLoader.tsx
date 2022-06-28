import { Fragment, h } from 'preact';
import Spinner from '../../../../../internal/Spinner';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import './CtPLoader.scss';

const CtPLoader = (): h.JSX.Element => {
    const { i18n } = useCoreContext();

    return (
        <Fragment>
            <div className="adyen-checkout-ctp__loading-loader">
                <Spinner size="medium" />
            </div>
            <div className="adyen-checkout-ctp__loading-title">{i18n.get('ctp.loading.poweredByCtp')}</div>
            <div className="adyen-checkout-ctp__loading-subtitle">{i18n.get('ctp.loading.intro')}</div>
        </Fragment>
    );
};

export default CtPLoader;
