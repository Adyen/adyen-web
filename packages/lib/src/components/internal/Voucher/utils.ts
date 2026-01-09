import { GetImageFnType } from '../../../core/Context/Resources';
import Language from '../../../language';
import { PaymentAmount } from '../../../types';
import { CommonVoucherProps, VoucherConfiguration } from './types';

export const extractCommonPropsForVoucher = ({
    props,
    i18n,
    introKey,
    getImage
}: {
    props: VoucherConfiguration & { totalAmount?: PaymentAmount };
    i18n: Language;
    introKey: string;
    getImage: GetImageFnType;
}): CommonVoucherProps => {
    const { paymentMethodType, onActionHandled, totalAmount, reference } = props;

    return {
        // occur in all vouchers
        paymentMethodType,
        introduction: i18n.get(introKey),
        imageUrl: getImage(paymentMethodType),
        onActionHandled,
        // occurs in 7/8 vouchers
        ...(totalAmount ? { amount: i18n.amount(totalAmount.value, totalAmount.currency) } : {}),
        // occurs in 6/8 vouchers
        ...(reference ? { reference } : {})
    };
};
