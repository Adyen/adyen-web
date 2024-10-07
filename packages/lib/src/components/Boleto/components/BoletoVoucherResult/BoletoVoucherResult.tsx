import { h } from 'preact';
import Voucher from '../../../internal/Voucher';

import { useCoreContext } from '../../../../core/Context/CoreProvider';
import './BoletoVoucherResult.scss';
import { VoucherDetail } from '../../../internal/Voucher/types';
import useImage from '../../../../core/Context/useImage';
import { extractCommonPropsForVoucher } from '../../../internal/Voucher/utils';

const BoletoVoucherResult = props => {
    const { i18n, loadingContext } = useCoreContext();
    const getImage = useImage();
    const { reference, expiresAt, downloadUrl } = props;
    const barcodeReference = reference.replace(/[^\d]/g, '').replace(/^(\d{4})(\d{5})\d{1}(\d{10})\d{1}(\d{10})\d{1}(\d{15})$/, '$1$5$2$3$4');
    const barcodeUrl = `${loadingContext}barcode.shtml?data=${barcodeReference}&barcodeType=BT_Int2of5A&fileType=png`;

    const paymentMethodType = 'boletobancario'; // overwrite the bank specific type of boleto, e.g. 'boletobancario_santander', to a more generic form

    return (
        <Voucher
            {...extractCommonPropsForVoucher({
                props: { ...props, paymentMethodType },
                i18n,
                introKey: 'voucher.introduction',
                getImage: getImage()
            })}
            barcode={barcodeUrl}
            voucherDetails={[{ label: i18n.get('voucher.expirationDate'), value: i18n.date(expiresAt) }] as VoucherDetail[]}
            downloadUrl={downloadUrl}
            copyBtn
        />
    );
};

export default BoletoVoucherResult;
