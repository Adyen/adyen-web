import { h } from 'preact';

import useCoreContext from '../../../core/Context/useCoreContext';
import Voucher from '../../internal/Voucher';
import '../../internal/Voucher/Voucher.scss';
import './BacsResult.scss';

const BacsResult = props => {
    const { i18n, loadingContext, resources } = useCoreContext();
    const { url, paymentMethodType } = props;

    return (
        <Voucher
            paymentMethodType={paymentMethodType}
            introduction={i18n.get('bacs.result.introduction')}
            imageUrl={resources.getImage({ loadingContext })(paymentMethodType)}
            downloadUrl={url}
            downloadButtonText={i18n.get('download.pdf')}
        />
    );
};

export default BacsResult;
