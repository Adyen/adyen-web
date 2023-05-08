import { Fragment, h } from 'preact';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useImage from '../../../../../core/Context/useImage';
import Img from '../../../Img';
import './CtPLoader.scss';

const CtPLoader = (): h.JSX.Element => {
    const { i18n } = useCoreContext();
    const getImage = useImage();

    return (
        <Fragment>
            <Img
                className="adyen-checkout-ctp__loading-image"
                src={getImage({ extension: 'gif', imageFolder: 'components/' })('ctp_loader')}
                alt=""
                height={120}
            />
            <div className="adyen-checkout-ctp__loading-subtitle">{i18n.get('ctp.loading.intro')}</div>
        </Fragment>
    );
};

export default CtPLoader;
