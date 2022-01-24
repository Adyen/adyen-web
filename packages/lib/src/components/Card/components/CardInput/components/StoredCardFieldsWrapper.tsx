import { h } from 'preact';
import LoadingWrapper from '../../../../internal/LoadingWrapper';
import StoredCardFields from './StoredCardFields';
import Installments from './Installments';

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

            {hasInstallments && (
                <Installments
                    amount={props.amount}
                    brand={sfpState.brand}
                    installmentOptions={props.installmentOptions}
                    onChange={handleInstallments}
                    type={showAmountsInInstallments ? 'amount' : 'months'}
                />
            )}
        </LoadingWrapper>
    );
};
