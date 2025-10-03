import { h } from 'preact';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import useImage from '../../../../core/Context/useImage';
import DetailsTable from '../../../internal/DetailsTable';
import { BankTransferResultInstructions } from './BankTransferResultInstructions';
import BankTransferVoucher from './BankTransferVoucher';
import type { ActionHandledReturnObject } from '../../../../types/global-types';

export interface BankTransferResultProps {
    paymentMethodType?: string;
    reference?: string;
    totalAmount?: { value: number; currency: string };
    beneficiary?: string;
    iban?: string;
    bic?: string;
    accountNumber?: string;
    sortCode?: string;
    routingNumber?: string;
    branchCode?: string;
    bankCode?: string;
    onActionHandled?: (actionHandledObj: ActionHandledReturnObject) => void;
}

export default function BankTransferResult(props: BankTransferResultProps) {
    const { i18n } = useCoreContext();
    const getImage = useImage();

    // we don't have to filter these values here, they get filtered inside the DetailsTable component
    const tableFields = [
        { label: i18n.get('bankTransfer.beneficiary'), value: props.beneficiary },
        { label: i18n.get('bankTransfer.accountNumber'), value: props.accountNumber },
        { label: i18n.get('bankTransfer.sortCode'), value: props.sortCode },
        { label: i18n.get('bankTransfer.routingNumber'), value: props.routingNumber },
        { label: i18n.get('bankTransfer.iban'), value: props.iban },
        { label: i18n.get('bankTransfer.branchCode'), value: props.branchCode },
        { label: i18n.get('bankTransfer.bankCode'), value: props.bankCode },
        { label: i18n.get('bankTransfer.reference'), value: props.reference },
        { label: i18n.get('bankTransfer.bic'), value: props.bic }
    ];

    return (
        <BankTransferVoucher
            paymentMethodType={props.paymentMethodType}
            imageUrl={getImage()(props.paymentMethodType)}
            onActionHandled={props.onActionHandled}
            amount={i18n.amount(props.totalAmount.value, props.totalAmount.currency)}
            instructions={<BankTransferResultInstructions />}
            voucherDetails={<DetailsTable shouldShowCopyButton tableFields={tableFields} />}
        />
    );
}
