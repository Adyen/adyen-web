import { h } from 'preact';
import Voucher from '../../../internal/Voucher';

import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { DokuVoucherResultProps } from '../../types';
import useImage from '../../../../core/Context/useImage';
import { extractCommonPropsForVoucher } from '../../../internal/Voucher/utils';

const DokuVoucherResult = (props: DokuVoucherResultProps) => {
    const { expiresAt, instructionsUrl, shopperName, merchantName } = props;
    const { i18n } = useCoreContext();
    const getImage = useImage();

    return (
        <Voucher
            {...extractCommonPropsForVoucher({ props, i18n, introKey: 'voucher.introduction.doku', getImage: getImage() })}
            instructionsUrl={instructionsUrl}
            voucherDetails={[
                { label: i18n.get('voucher.expirationDate'), value: i18n.date(expiresAt) },
                { label: i18n.get('voucher.shopperName'), value: shopperName },
                { label: i18n.get('voucher.merchantName'), value: merchantName }
            ]}
            copyBtn
        />
    );
};

export default DokuVoucherResult;
