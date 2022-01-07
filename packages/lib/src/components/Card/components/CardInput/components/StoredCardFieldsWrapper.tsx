import { h } from 'preact';
import LoadingWrapper from '../../../../internal/LoadingWrapper';
import StoredCardFields from './StoredCardFields';
import { getInstallmentsComp } from './Installments/GetInstallmentsComp';

export const StoredCardFieldsWrapper = ({
    sfpState,
    setFocusOn,
    cvcPolicy,
    focusedElement,
    hasInstallments,
    handleInstallments,
    showAmountsInInstallments,
    ...props
}) => {
    return (
        <LoadingWrapper status={sfpState.status}>
            <StoredCardFields
                {...props}
                errors={sfpState.errors}
                brand={sfpState.brand}
                hasCVC={props.hasCVC}
                cvcPolicy={cvcPolicy}
                onFocusField={setFocusOn}
                focusedElement={focusedElement}
                status={sfpState.status}
                valid={sfpState.valid}
            />

            {hasInstallments &&
                getInstallmentsComp({
                    brand: sfpState.brand,
                    amount: props.amount,
                    installmentOptions: props.installmentOptions,
                    handleInstallments,
                    showAmountsInInstallments
                })}
        </LoadingWrapper>
    );
};
