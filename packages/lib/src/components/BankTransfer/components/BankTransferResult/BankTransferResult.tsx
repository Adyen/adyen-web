import { Fragment, h } from 'preact';

import { useCoreContext } from '../../../../core/Context/CoreProvider';
import useImage from '../../../../core/Context/useImage';
import DetailsTable from '../../../internal/DetailsTable';
import { ResultPanel } from '../../../internal/ResultPanel';
import { BankTransferResultInstructions } from './BankTransferResultInstructions';

import type { ActionHandledReturnObject } from '../../../../types/global-types';

import './BankTransferResult.scss';

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

export default function BankTransferResult(props: Readonly<BankTransferResultProps>) {
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

    const imageUrl = getImage()(props.paymentMethodType);

    props.onActionHandled?.({ componentType: props.paymentMethodType, actionDescription: 'voucher-presented' });

    return (
        <ResultPanel
            classNames={{
                root: `adyen-checkout__bank-transfer-result adyen-checkout__voucher-result adyen-checkout__voucher-result--bankTransfer adyen-checkout__voucher-result--${props.paymentMethodType}`,
                details: 'adyen-checkout__bank-transfer-result__top adyen-checkout__voucher-result__top',
                actions: 'adyen-checkout__bank-transfer-result__bottom adyen-checkout__voucher-result__bottom'
            }}
            details={
                <Fragment>
                    <div className="adyen-checkout__voucher-result__image">
                        {!!imageUrl && (
                            <span className="adyen-checkout__voucher-result__image__wrapper">
                                <img alt={props.paymentMethodType} className="adyen-checkout__voucher-result__image__brand" src={imageUrl} />
                            </span>
                        )}
                    </div>
                    <div className="adyen-checkout__voucher-result__amount">{i18n.amount(props.totalAmount.value, props.totalAmount.currency)}</div>
                    <div className="adyen-checkout__voucher-result-title">{i18n.get('bankTransfer.instruction.title')}</div>
                    <BankTransferResultInstructions />
                </Fragment>
            }
            actions={
                <Fragment>
                    <div className="adyen-checkout__voucher-result-title">{i18n.get('bankTransfer.details.title')}</div>
                    <DetailsTable shouldShowCopyButton tableFields={tableFields} />
                </Fragment>
            }
        />
    );
}
