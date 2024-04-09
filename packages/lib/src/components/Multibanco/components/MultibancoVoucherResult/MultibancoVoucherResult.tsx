import { h } from 'preact';
import Voucher from '../../../internal/Voucher';

import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { MultibancoVoucherResultProps } from '../../types';
import { VoucherDetail } from '../../../internal/Voucher/types';
import useImage from '../../../../core/Context/useImage';

const MultibancoVoucherResult = (props: MultibancoVoucherResultProps) => {
    const { i18n } = useCoreContext();
    const getImage = useImage();
    const { entity, reference, expiresAt, merchantReference, totalAmount, paymentMethodType, downloadUrl } = props;

    const voucherDetails: VoucherDetail[] = [
        ...(entity ? [{ label: i18n.get('voucher.entity'), value: entity }] : []),
        ...(expiresAt ? [{ label: i18n.get('voucher.expirationDate'), value: i18n.date(expiresAt) }] : []),
        ...(merchantReference ? [{ label: i18n.get('voucher.shopperReference'), value: merchantReference }] : [])
    ];

    return (
        <Voucher
            amount={totalAmount && i18n.amount(totalAmount.value, totalAmount.currency)}
            barcode={null}
            copyBtn
            downloadUrl={downloadUrl}
            imageUrl={getImage()(paymentMethodType)}
            introduction={i18n.get('voucher.introduction')}
            paymentMethodType={'multibanco'}
            reference={reference}
            voucherDetails={voucherDetails}
        />
    );
};

export default MultibancoVoucherResult;
