import { h } from 'preact';
import Voucher from '../../../internal/Voucher';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { VoucherDetail } from '../../../internal/Voucher/types';
import useImage from '../../../../core/Context/useImage';
import { extractCommonPropsForVoucher } from '../../../internal/Voucher/utils';
import { ActionHandledReturnObject, PaymentAmount } from '../../../../types/global-types';

interface MultibancoVoucherResultProps {
    entity?: string;
    reference?: string;
    expiresAt?: string;
    merchantReference?: string;
    totalAmount?: PaymentAmount;
    paymentMethodType?: string;
    downloadUrl?: string;
    onActionHandled?: (rtnObj: ActionHandledReturnObject) => void;
}

const MultibancoVoucherResult = (props: Readonly<MultibancoVoucherResultProps>) => {
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
