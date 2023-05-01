import { Fragment, h } from 'preact';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import './CtPLoader.scss';
import Img from '../../../../../internal/Img';

const CtPLoader = (): h.JSX.Element => {
    const { i18n, resources } = useCoreContext();

    return (
        <Fragment>
            <Img
                className="adyen-checkout-ctp__loading-image"
                src={resources.getImage({ extension: 'gif', imageFolder: 'components/' })('ctp_loader')}
                alt=""
                height={120}
            />
            <div className="adyen-checkout-ctp__loading-subtitle">{i18n.get('ctp.loading.intro')}</div>
        </Fragment>
    );
};

export default CtPLoader;
