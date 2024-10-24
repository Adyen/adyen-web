import { h } from 'preact';
import Voucher from '../../../../components/internal/Voucher';
import { VoucherDetail } from '../../../internal/Voucher/types';

import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { OxxoVoucherResultProps } from '../../types';
import './OxxoVoucherResult.scss';
import useImage from '../../../../core/Context/useImage';
import { extractCommonPropsForVoucher } from '../../../internal/Voucher/utils';

const OxxoVoucherResult = (props: OxxoVoucherResultProps) => {
    const { i18n, loadingContext } = useCoreContext();
    const getImage = useImage();
    const { alternativeReference, reference, expiresAt, merchantReference, downloadUrl } = props;

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
            {...extractCommonPropsForVoucher({ props, i18n, introKey: 'voucher.introduction', getImage: getImage() })}
            barcode={barcodeUrl}
            copyBtn
            downloadUrl={downloadUrl}
            voucherDetails={voucherDetails}
        />
    );
};

export default OxxoVoucherResult;
