import { h } from 'preact';
import LoadingWrapper from '../../../../internal/LoadingWrapper';
import StoredCardFields from './StoredCardFields';
import Installments from './Installments';
import { ErrorPanel } from '../../../../../core/Errors/ErrorPanel';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import DisclaimerMessage from './DisclaimerMessage';

export const StoredCardFieldsWrapper = ({
    // base (shared)
    collateErrors,
    errorFieldId,
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
    expiryYear,
    // Card
    mergedSRErrors,
    handleErrorPanelFocus,
    moveFocus,
    showPanel,
    disclaimerMessage
}) => {
    const { i18n } = useCoreContext();

    return (
        <LoadingWrapper status={sfpState.status}>
            {collateErrors && (
                <ErrorPanel
                    id={errorFieldId}
                    heading={i18n.get('errorPanel.title')}
                    errors={mergedSRErrors}
                    callbackFn={moveFocus ? handleErrorPanelFocus : null}
                    showPanel={showPanel}
                />
            )}

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

            {disclaimerMessage && <DisclaimerMessage disclaimer={disclaimerMessage} />}
        </LoadingWrapper>
    );
};
