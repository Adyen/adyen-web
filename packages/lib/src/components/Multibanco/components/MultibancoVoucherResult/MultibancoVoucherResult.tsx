import { h } from 'preact';
import Voucher from '../../../internal/Voucher';

import useCoreContext from '../../../../core/Context/useCoreContext';
import { MultibancoVoucherResultProps } from '../../types';
import { VoucherDetail } from '../../../internal/Voucher/types';

const MultibancoVoucherResult = (props: MultibancoVoucherResultProps) => {
    const { i18n, loadingContext, resources } = useCoreContext();
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
            imageUrl={resources.getImage({ loadingContext })(paymentMethodType)}
            introduction={i18n.get('voucher.introduction')}
            paymentMethodType={'multibanco'}
            reference={reference}
            voucherDetails={voucherDetails}
        />
    );
};

export default MultibancoVoucherResult;
