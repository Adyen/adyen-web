import { h } from 'preact';
import LoadingWrapper from '../../../../internal/LoadingWrapper';
import StoredCardFields from './StoredCardFields';
import Installments from './Installments';

export const StoredCardFieldsWrapper = ({
    // base (shared)
    // n/a
    // vars created in CardInput:
    sfpState,
    setFocusOn,
    cvcPolicy,
    focusedElement,
    hasInstallments,
    handleInstallments,
    showAmountsInInstallments,
    // props passed through from CardInput:
    amount,
    hasCVC,
    installmentOptions,
    lastFour,
    expiryMonth,
    expiryYear
    // Card
}) => {
    return (
        <LoadingWrapper status={sfpState.status}>
            <StoredCardFields
                errors={sfpState.errors}
                brand={sfpState.brand}
                hasCVC={hasCVC}
                cvcPolicy={cvcPolicy}
                onFocusField={setFocusOn}
                focusedElement={focusedElement}
                status={sfpState.status}
                valid={sfpState.valid}
                lastFour={lastFour}
                expiryMonth={expiryMonth}
                expiryYear={expiryYear}
            />

            {hasInstallments && (
                <Installments
                    amount={amount}
                    brand={sfpState.brand}
                    installmentOptions={installmentOptions}
                    onChange={handleInstallments}
                    type={showAmountsInInstallments ? 'amount' : 'months'}
                />
            )}
        </LoadingWrapper>
    );
};
