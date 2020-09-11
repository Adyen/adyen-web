import { h } from 'preact';
import { getImageUrl } from '../../../../utils/get-image';
import Img from '../../../internal/Img';
import useCoreContext from '../../../../core/Context/useCoreContext';

const Success = ({ message }) => {
    const { i18n, loadingContext } = useCoreContext();
    return (
        <div className="adyen-checkout__status adyen-checkout__status--success">
            <Img
                height="88"
                className="adyen-checkout__status__icon"
                src={getImageUrl({ loadingContext, imageFolder: 'components/' })('success')}
                alt={i18n.get(message || 'creditCard.success')}
            />
            <span className="adyen-checkout__status__text">{i18n.get(message || 'creditCard.success')}</span>
        </div>
    );
};

export default Success;
