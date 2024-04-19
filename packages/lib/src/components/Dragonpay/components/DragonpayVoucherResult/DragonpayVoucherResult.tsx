import { h } from 'preact';
import Voucher from '../../../internal/Voucher';
import getIssuerImageUrl from '../../../../utils/get-issuer-image';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { DragonpayVoucherResultProps } from '../../types';
import { VoucherDetail } from '../../../internal/Voucher/types';
import useImage from '../../../../core/Context/useImage';

export default function DragonpayVoucherResult(props: DragonpayVoucherResultProps) {
    const { reference, totalAmount, surcharge, expiresAt, alternativeReference, instructionsUrl, icon, issuer, paymentMethodType } = props;
    const { i18n } = useCoreContext();
    const getImage = useImage();
    const issuerImageUrl =
        paymentMethodType !== 'dragonpay_otc_philippines' ? getIssuerImageUrl({}, paymentMethodType, getImage)(issuer.toLowerCase()) : null;

    return (
        <Voucher
            reference={reference}
            paymentMethodType={paymentMethodType}
            introduction={i18n.get('voucher.introduction')}
            imageUrl={icon}
            issuerImageUrl={issuerImageUrl}
            instructionsUrl={instructionsUrl}
            amount={totalAmount && i18n.amount(totalAmount.value, totalAmount.currency)}
            surcharge={surcharge && i18n.amount(surcharge.value, surcharge.currency)}
            voucherDetails={
                [
                    { label: i18n.get('voucher.expirationDate'), value: i18n.dateTime(expiresAt) },
                    { label: i18n.get('voucher.alternativeReference'), value: alternativeReference }
                ] as VoucherDetail[]
            }
            copyBtn
        />
    );
}
