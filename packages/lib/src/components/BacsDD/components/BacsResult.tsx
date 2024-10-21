import { h } from 'preact';

import { useCoreContext } from '../../../core/Context/CoreProvider';
import Voucher from '../../internal/Voucher';
import '../../internal/Voucher/Voucher.scss';
import './BacsResult.scss';
import useImage from '../../../core/Context/useImage';
import { extractCommonPropsForVoucher } from '../../internal/Voucher/utils';

const BacsResult = props => {
    const { i18n } = useCoreContext();
    const getImage = useImage();

    return (
        <Voucher
            {...extractCommonPropsForVoucher({ props, i18n, introKey: 'bacs.result.introduction', getImage: getImage() })}
            downloadUrl={props.url}
            downloadButtonText={i18n.get('download.pdf')}
        />
    );
};

export default BacsResult;
