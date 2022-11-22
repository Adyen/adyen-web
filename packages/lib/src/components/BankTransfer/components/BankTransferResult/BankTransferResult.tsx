import { h } from 'preact';
import Voucher from '../../../internal/Voucher';

import useCoreContext from '../../../../core/Context/useCoreContext';

export default function BankTransferResult(props) {
    const { reference, totalAmount, paymentMethodType } = props;
    const { loadingContext, i18n, resources } = useCoreContext();

    return (
        <Voucher
            paymentMethodType={paymentMethodType}
            introduction={i18n.get('bankTransfer.instructions')}
            imageUrl={resources.getImage({ loadingContext })(paymentMethodType)}
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
