import { h } from 'preact';
import Voucher from '../../../internal/Voucher';

import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { MultibancoVoucherResultProps } from '../../types';
import { VoucherDetail } from '../../../internal/Voucher/types';
import useImage from '../../../../core/Context/useImage';
import { extractCommonPropsForVoucher } from '../../../internal/Voucher/utils';

const MultibancoVoucherResult = (props: MultibancoVoucherResultProps) => {
    const { i18n } = useCoreContext();
    const getImage = useImage();
    const { entity, expiresAt, merchantReference, downloadUrl } = props;

    const voucherDetails: VoucherDetail[] = [
        ...(entity ? [{ label: i18n.get('voucher.entity'), value: entity }] : []),
        ...(expiresAt ? [{ label: i18n.get('voucher.expirationDate'), value: i18n.date(expiresAt) }] : []),
        ...(merchantReference ? [{ label: i18n.get('voucher.shopperReference'), value: merchantReference }] : [])
    ];

    return (
        <Voucher
            {...extractCommonPropsForVoucher({ props, i18n, introKey: 'voucher.introduction', getImage: getImage() })}
            barcode={null}
            copyBtn
            downloadUrl={downloadUrl}
            voucherDetails={voucherDetails}
        />
    );
};

export default MultibancoVoucherResult;
