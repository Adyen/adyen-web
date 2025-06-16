import { Fragment, h } from 'preact';
import Voucher from '../../../internal/Voucher';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import useImage from '../../../../core/Context/useImage';
import { extractCommonPropsForVoucher } from '../../../internal/Voucher/utils';
import type { ActionHandledReturnObject } from '../../../../types/global-types';
import DetailsTable from '../../../internal/DetailsTable';
import { BankTransferResultInstructions } from './BankTransferResultInstructions';

export interface BankTransferResultProps {
    ref?: (ref: any) => void;
    paymentMethodType?: string;
    reference?: string;
    totalAmount?: { value: number; currency: string };
    beneficiary?: string;
    iban?: string;
    bic?: string;
    onActionHandled?: (actionHandledObj: ActionHandledReturnObject) => void;
}

export default function BankTransferResult(props: BankTransferResultProps) {
    const { reference } = props;
    const { i18n } = useCoreContext();
    const getImage = useImage();

    return (
        <Fragment>
            <BankTransferResultInstructions />
            <DetailsTable
                shouldShowCopyButton
                tableFields={[
                    { label: i18n.get('bankTransfer.beneficiary'), value: props.beneficiary },
                    { label: i18n.get('bankTransfer.iban'), value: props.iban },
                    { label: i18n.get('bankTransfer.bic'), value: props.bic },
                    { label: i18n.get('bankTransfer.reference'), value: reference }
                ]}
            />

            <Voucher
                {...extractCommonPropsForVoucher({ props, i18n, introKey: 'bankTransfer.instructions', getImage: getImage() })}
                reference={''} // Overwrite the passed reference, so it is not displayed in its own section (since it is already part of the voucherDetails)
                voucherDetails={[
                    { label: i18n.get('bankTransfer.beneficiary'), value: props.beneficiary },
                    { label: i18n.get('bankTransfer.iban'), value: props.iban },
                    { label: i18n.get('bankTransfer.bic'), value: props.bic },
                    { label: i18n.get('bankTransfer.reference'), value: reference }
                ]}
            />
        </Fragment>
    );
}
