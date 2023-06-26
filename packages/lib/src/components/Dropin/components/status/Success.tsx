import { h } from 'preact';

import Img from '../../../internal/Img';
import useCoreContext from '../../../../core/Context/useCoreContext';
import useImage from '../../../../core/Context/useImage';
import { useA11yReporter } from '../../../../core/Errors/useA11yReporter';

const Success = ({ message }) => {
    const { i18n } = useCoreContext();
    const getImage = useImage();
    const status = i18n.get(message || 'creditCard.success');
    useA11yReporter(status);
    return (
        <div className="adyen-checkout__status adyen-checkout__status--success">
            <Img
                height="88"
                className="adyen-checkout__status__icon"
                src={getImage({ extension: 'gif', imageFolder: 'components/' })('success')}
                alt={i18n.get(message || 'creditCard.success')}
            />
            <span className="adyen-checkout__status__text">{status}</span>
        </div>
    );
};

export default Success;
