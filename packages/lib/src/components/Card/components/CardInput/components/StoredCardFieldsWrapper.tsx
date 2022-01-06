import { h } from 'preact';
import styles from '../CardInput.module.scss';
import LoadingWrapper from '../../../../internal/LoadingWrapper';
import StoredCardFields from './StoredCardFields';
import getImage from '../../../../../utils/get-image';

export const StoredCardFieldsWrapper = ({
    status,
    i18n,
    setRootNode,
    sfpState,
    setFocusOn,
    collateErrors,
    errorFieldId,
    cvcPolicy,
    focusedElement,
    hasInstallments,
    getInstallmentsComp,
    ...props
}) => {
    return (
        <div
            ref={setRootNode}
            className={`adyen-checkout__card-input ${styles['card-input__wrapper']} adyen-checkout__card-input--${props.fundingSource ?? 'credit'}`}
            role={collateErrors && 'form'}
            aria-describedby={collateErrors ? errorFieldId : null}
        >
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

                {hasInstallments && getInstallmentsComp(sfpState.brand)}
            </LoadingWrapper>

            {props.showPayButton &&
                props.payButton({ status, icon: getImage({ loadingContext: props.loadingContext, imageFolder: 'components/' })('lock') })}
        </div>
    );
};
