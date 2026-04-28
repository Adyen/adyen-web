import { Component, h } from 'preact';
import classNames from 'classnames';

import { PaymentMethodDetails } from '../PaymentMethodDetails';
import PaymentMethodIcon from '../PaymentMethodIcon';
import DisableOneClickConfirmation from '../DisableOneClickConfirmation';
import UIElement from '../../../../internal/UIElement/UIElement';
import PaymentMethodBrands from '../PaymentMethodBrands/PaymentMethodBrands';
import { BRAND_ICON_UI_EXCLUSION_LIST } from '../../../../internal/SecuredFields/lib/constants';
import PaymentMethodName from '../PaymentMethodName';
import { useCoreContext } from '../../../../../core/Context/CoreProvider';
import ExpandButton from '../../../../internal/ExpandButton';
import { getFullBrandName } from '../../../../Card/components/CardInput/utils';
import { stopPropagationForActionKeys } from '../../../../internal/Button/stopPropagationForActionKeys';
import './PaymentMethodItem.scss';
import Button from '../../../../internal/Button';

export interface PaymentMethodItemProps {
    paymentMethod: UIElement;
    isSelected?: boolean;
    isLoading?: boolean;
    isDisablingPaymentMethod: boolean;
    showRemovePaymentMethodButton: boolean;
    onDisableStoredPaymentMethod: (paymentMethod) => void;
    onSelect: (paymentMethod: UIElement) => void;
    standalone: boolean;
    className?: string;
    showRadioButton?: boolean;
}

class PaymentMethodItem extends Component<Readonly<PaymentMethodItemProps>> {
    public static readonly defaultProps = {
        paymentMethod: null,
        isSelected: false,
        isLoaded: false,
        isLoading: false,
        showDisableStoredPaymentMethodConfirmation: false,
        showRadioButton: false
    };

    public state = {
        showDisableStoredPaymentMethodConfirmation: false
    };

    public toggleDisableConfirmation = () => {
        this.setState({ showDisableStoredPaymentMethodConfirmation: !this.state.showDisableStoredPaymentMethodConfirmation });
    };

    public onDisableStoredPaymentMethod = () => {
        this.props.onDisableStoredPaymentMethod(this.props.paymentMethod);
        this.toggleDisableConfirmation();
    };

    private readonly handleOnListItemClick = (): void => {
        const { onSelect, paymentMethod } = this.props;
        onSelect(paymentMethod);
    };

    // @ts-ignore need to refine the type for paymentMethod
    render({ paymentMethod, isSelected, isDisablingPaymentMethod, isLoading, standalone, showRadioButton }) {
        const { i18n } = useCoreContext();

        if (!paymentMethod) {
            return null;
        }

        const isCard = paymentMethod.props.type === 'card' || paymentMethod.props.type === 'scheme';

        const paymentMethodClassnames = classNames({
            'adyen-checkout__payment-method': true,
            [`adyen-checkout__payment-method--${paymentMethod.props.type}`]: true,
            ...(isCard && { [`adyen-checkout__payment-method--${paymentMethod.props.fundingSource ?? 'credit'}`]: true }),
            'adyen-checkout__payment-method--selected': isSelected,
            'adyen-checkout__payment-method--loading': isLoading,
            'adyen-checkout__payment-method--disabling': isDisablingPaymentMethod,
            'adyen-checkout__payment-method--confirming': this.state.showDisableStoredPaymentMethodConfirmation,
            'adyen-checkout__payment-method--standalone': standalone,
            [paymentMethod._id]: true,
            [this.props.className]: true
        });

        const showRemovePaymentMethodButton = this.props.showRemovePaymentMethodButton && paymentMethod.props.oneClick && isSelected;
        const disableConfirmationId = `remove-${paymentMethod._id}`;
        const containerId = `container-${paymentMethod._id}`;
        const buttonId = `button-${paymentMethod._id}`;

        const showBrands = !paymentMethod.props.oneClick && paymentMethod.brands && paymentMethod.brands.length > 0;

        return (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
            <div key={paymentMethod._id} className={paymentMethodClassnames} onClick={this.handleOnListItemClick}>
                <div className="adyen-checkout__payment-method__header">
                    <ExpandButton
                        className="adyen-checkout__payment-method__header__content"
                        buttonId={buttonId}
                        showRadioButton={showRadioButton}
                        isSelected={isSelected}
                        expandContentId={containerId}
                        standalone={standalone}
                    >
                        <PaymentMethodIcon
                            // Only add alt attribute to storedPaymentMethods (to avoid SR reading the PM name twice)
                            {...(paymentMethod.props.oneClick && { altDescription: getFullBrandName(paymentMethod.props.brand) })}
                            type={paymentMethod.type}
                            src={paymentMethod.icon}
                        />

                        <div className="adyen-checkout__payment-method__header__details">
                            <PaymentMethodName
                                displayName={paymentMethod.displayName}
                                isSelected={isSelected}
                                additionalInfo={paymentMethod.additionalInfo}
                            />
                            {showBrands && (
                                <PaymentMethodBrands
                                    showOtherInsteadOfNumber={paymentMethod.props.showOtherInsteadOfNumber}
                                    keepBrandsVisible={paymentMethod.props.keepBrandsVisible}
                                    brands={paymentMethod.brands}
                                    excludedUIBrands={BRAND_ICON_UI_EXCLUSION_LIST}
                                    isPaymentMethodSelected={isSelected}
                                />
                            )}
                        </div>
                    </ExpandButton>

                    {showRemovePaymentMethodButton && (
                        <Button
                            inline
                            variant="link"
                            onClick={this.toggleDisableConfirmation}
                            onKeyPress={stopPropagationForActionKeys}
                            onKeyDown={stopPropagationForActionKeys}
                            ariaExpanded={this.state.showDisableStoredPaymentMethodConfirmation}
                            ariaControls={disableConfirmationId}
                        >
                            {i18n.get('storedPaymentMethod.disable.button')}
                        </Button>
                    )}
                </div>

                <div className="adyen-checkout-pm-details-wrapper" aria-hidden={!isSelected}>
                    <div className="adyen-checkout__payment-method__details" id={containerId} inert={isSelected ? undefined : true}>
                        {showRemovePaymentMethodButton && (
                            <DisableOneClickConfirmation
                                id={disableConfirmationId}
                                open={this.state.showDisableStoredPaymentMethodConfirmation}
                                onDisable={this.onDisableStoredPaymentMethod}
                                onCancel={this.toggleDisableConfirmation}
                            />
                        )}

                        <PaymentMethodDetails paymentMethodComponent={paymentMethod} isSelected={isSelected} />
                    </div>
                </div>
            </div>
        );
    }
}

export default PaymentMethodItem;
