import { CommonVoucherProps } from './types';

export const extractCommonPropsForVoucher = ({ props, i18n, introKey, getImage }): CommonVoucherProps => {
    const { paymentMethodType, onActionHandled, originalAction, totalAmount, reference } = props;

    return {
        // occur in all vouchers
        paymentMethodType,
        introduction: i18n.get(introKey),
        imageUrl: getImage(paymentMethodType),
        onActionHandled,
        originalAction,
        // occurs in 7/8 vouchers
        ...(totalAmount ? { amount: i18n.amount(totalAmount.value, totalAmount.currency) } : {}),
        // occurs in 6/8 vouchers
        ...(reference ? { reference } : {})
    };
};
