import { h } from 'preact';
import getImage from '../../../utils/get-image';
import useCoreContext from '../../../core/Context/useCoreContext';
import Voucher from '../../internal/Voucher';
import '../../internal/Voucher/Voucher.scss';
import './BacsResult.scss';

const BacsResult = props => {
    const { i18n, loadingContext } = useCoreContext();
    const { url, paymentMethodType } = props;

    return (
        <Voucher
            paymentMethodType={paymentMethodType}
            introduction={i18n.get('voucher.introduction')}
            imageUrl={getImage({ loadingContext })(paymentMethodType)}
            downloadUrl={url}
        />
    );
};

export default BacsResult;
