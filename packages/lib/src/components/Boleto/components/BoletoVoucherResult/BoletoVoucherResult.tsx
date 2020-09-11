import { h } from 'preact';
import Voucher from '../../../internal/Voucher';
import getImage from '../../../../utils/get-image';
import useCoreContext from '../../../../core/Context/useCoreContext';
import './BoletoVoucherResult.scss';
import { VoucherDetail } from '../../../internal/Voucher/types';

const BoletoVoucherResult = props => {
    const { i18n, loadingContext } = useCoreContext();
    const { reference, expiresAt, totalAmount, paymentMethodType, downloadUrl } = props;
    const barcodeReference = reference.replace(/[^\d]/g, '').replace(/^(\d{4})(\d{5})\d{1}(\d{10})\d{1}(\d{10})\d{1}(\d{15})$/, '$1$5$2$3$4');
    const barcodeUrl = `${loadingContext}barcode.shtml?data=${barcodeReference}&barcodeType=BT_Int2of5A&fileType=png`;

    return (
        <Voucher
            reference={reference}
            paymentMethodType={'boletobancario'}
            barcode={barcodeUrl}
            introduction={i18n.get('voucher.introduction')}
            imageUrl={getImage({ loadingContext })(paymentMethodType)}
            amount={totalAmount && i18n.amount(totalAmount.value, totalAmount.currency)}
            voucherDetails={[{ label: i18n.get('voucher.expirationDate'), value: i18n.date(expiresAt) }] as VoucherDetail[]}
            downloadUrl={downloadUrl}
            copyBtn
        />
    );
};

export default BoletoVoucherResult;
