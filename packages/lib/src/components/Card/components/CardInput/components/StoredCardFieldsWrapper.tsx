import { h } from 'preact';
import LoadingWrapper from '../../../../internal/LoadingWrapper';
import StoredCardFields from './StoredCardFields';
import Installments from './Installments';
import DisclaimerMessage from '../../../../internal/DisclaimerMessage';

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
    showContextualElement,
    // props passed through from CardInput:
    amount,
    hasCVC,
    installmentOptions,
    lastFour,
    expiryMonth,
    expiryYear,
    // Card
    disclaimerMessage
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
                valid={sfpState.valid}
                lastFour={lastFour}
                expiryMonth={expiryMonth}
                expiryYear={expiryYear}
                showContextualElement={showContextualElement}
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

            {disclaimerMessage && (
                <DisclaimerMessage
                    message={disclaimerMessage.message.replace('%{linkText}', `%#${disclaimerMessage.linkText}%#`)}
                    urls={[disclaimerMessage.link]}
                />
            )}
        </LoadingWrapper>
    );
};
