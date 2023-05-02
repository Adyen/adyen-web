import { h } from 'preact';
import Voucher from '../../../../components/internal/Voucher';
import { VoucherDetail } from '../../../internal/Voucher/types';

import useCoreContext from '../../../../core/Context/useCoreContext';
import { OxxoVoucherResultProps } from '../../types';
import './OxxoVoucherResult.scss';
import useImage from '../../../../core/Context/useImage';

const OxxoVoucherResult = (props: OxxoVoucherResultProps) => {
    const { i18n, loadingContext } = useCoreContext();
    const getImage = useImage();
    const { alternativeReference, reference, expiresAt, merchantReference, totalAmount, paymentMethodType, downloadUrl } = props;

    const barcodeUrl = `${loadingContext}barcode.shtml?data=${reference}&barcodeType=BT_Code128C&fileType=png`;
    const voucherDetails: VoucherDetail[] = [
        ...(expiresAt
            ? [
                  {
                      label: i18n.get('voucher.expirationDate'),
                      value: i18n.date(expiresAt)
                  }
              ]
            : []),
        ...(merchantReference
            ? [
                  {
                      label: i18n.get('voucher.shopperReference'),
                      value: merchantReference
                  }
              ]
            : []),
        ...(alternativeReference
            ? [
                  {
                      label: i18n.get('voucher.alternativeReference'),
                      value: alternativeReference
                  }
              ]
            : [])
    ];

    return (
        <Voucher
            amount={totalAmount && i18n.amount(totalAmount.value, totalAmount.currency)}
            barcode={barcodeUrl}
            copyBtn
            downloadUrl={downloadUrl}
            imageUrl={getImage({})(paymentMethodType)}
            introduction={i18n.get('voucher.introduction')}
            paymentMethodType={'oxxo'}
            reference={reference}
            voucherDetails={voucherDetails}
        />
    );
};

export default OxxoVoucherResult;
