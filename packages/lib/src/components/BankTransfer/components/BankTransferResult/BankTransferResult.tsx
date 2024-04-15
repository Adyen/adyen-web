import { h } from 'preact';
import Voucher from '../../../internal/Voucher';

import { useCoreContext } from '../../../../core/Context/CoreProvider';
import useImage from '../../../../core/Context/useImage';

export default function BankTransferResult(props) {
    const { reference, totalAmount, paymentMethodType } = props;
    const { i18n } = useCoreContext();
    const getImage = useImage();

    return (
        <Voucher
            paymentMethodType={paymentMethodType}
            introduction={i18n.get('bankTransfer.instructions')}
            imageUrl={getImage()(paymentMethodType)}
            amount={totalAmount && i18n.amount(totalAmount.value, totalAmount.currency)}
            voucherDetails={[
                { label: i18n.get('bankTransfer.beneficiary'), value: props.beneficiary },
                { label: i18n.get('bankTransfer.iban'), value: props.iban },
                { label: i18n.get('bankTransfer.bic'), value: props.bic },
                { label: i18n.get('bankTransfer.reference'), value: reference }
            ]}
        />
    );
}
