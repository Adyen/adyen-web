import { ActionHandledReturnObject } from '../../../../types/global-types';

export interface BankTransferVoucherProps {
    /** Payment method used to generate the voucher. */
    paymentMethodType: string;

    /** Payment method image to be displayed on the voucher. */
    imageUrl?: string;

    /** Payment flow instruction */
    instructions?: any;

    /** Total amount displayed on the voucher. */
    amount?: string;

    /** List of details that will be rendered on the voucher. */
    voucherDetails?: any;

    /** Additional CSS classes. */
    className?: string;

    // callback, at Checkout level
    onActionHandled?: (rtnObj: ActionHandledReturnObject) => void;
}
