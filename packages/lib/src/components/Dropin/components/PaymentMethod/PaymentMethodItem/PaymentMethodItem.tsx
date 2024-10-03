import { Component, h } from 'preact';
import classNames from 'classnames';
import PaymentMethodDetails from '../PaymentMethodDetails';
import PaymentMethodIcon from '../PaymentMethodIcon';
import DisableOneClickConfirmation from '../DisableOneClickConfirmation';
import './PaymentMethodItem.scss';
import UIElement from '../../../../internal/UIElement/UIElement';
import PaymentMethodBrands from '../PaymentMethodBrands/PaymentMethodBrands';
import { BRAND_ICON_UI_EXCLUSION_LIST } from '../../../../internal/SecuredFields/lib/constants';
import PaymentMethodName from '../PaymentMethodName';
import { useCoreContext } from '../../../../../core/Context/CoreProvider';
import ExpandButton from '../../../../internal/ExpandButton';

export interface PaymentMethodItemProps {
    paymentMethod: UIElement;
    isSelected?: boolean;
    isLoaded?: boolean;
    isLoading?: boolean;
    isDisablingPaymentMethod: boolean;
    showRemovePaymentMethodButton: boolean;
    onDisableStoredPaymentMethod: (paymentMethod) => void;
    onSelect: (paymentMethod: UIElement) => void;
    standalone: boolean;
    className?: string;
    showRadioButton?: boolean;
}

class PaymentMethodItem extends Component<PaymentMethodItemProps> {
    public static defaultProps = {
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

    private handleOnListItemClick = (): void => {
        const { onSelect, paymentMethod } = this.props;
        onSelect(paymentMethod);
    };

    // @ts-ignore need to refine the type for paymentMethod
    render({ paymentMethod, isSelected, isDisablingPaymentMethod, isLoaded, isLoading, standalone, showRadioButton }) {
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
                    <ExpandButton buttonId={buttonId} showRadioButton={showRadioButton} isSelected={isSelected} expandContentId={containerId}>
                        <PaymentMethodIcon
                            // Only add alt attribute to storedPaymentMethods (to avoid SR reading the PM name twice)
                            {...(paymentMethod.props.oneClick && { altDescription: paymentMethod.props.name })}
                            type={paymentMethod.type}
                            src={paymentMethod.icon}
                        />

                        <PaymentMethodName
                            displayName={paymentMethod.displayName}
                            isSelected={isSelected}
                            additionalInfo={paymentMethod.additionalInfo}
                        />
                    </ExpandButton>

                    {showRemovePaymentMethodButton && (
                        <button
                            type="button"
                            className="adyen-checkout__button adyen-checkout__button--inline adyen-checkout__button--link"
                            onClick={this.toggleDisableConfirmation}
                            aria-expanded={this.state.showDisableStoredPaymentMethodConfirmation}
                            aria-controls={disableConfirmationId}
                        >
                            {i18n.get('storedPaymentMethod.disable.button')}
                        </button>
                    )}

                    {showBrands && (
                        <PaymentMethodBrands
                            showOtherInsteafOfNumber={paymentMethod.props.showOtherInsteafOfNumber}
                            keepBrandsVisible={paymentMethod.props.keepBrandsVisible}
                            brands={paymentMethod.brands}
                            excludedUIBrands={BRAND_ICON_UI_EXCLUSION_LIST}
                            isPaymentMethodSelected={isSelected}
                        />
                    )}
                </div>

                <div className="adyen-checkout-pm-details-wrapper" aria-hidden={!isSelected}>
                    <div className="adyen-checkout__payment-method__details" id={containerId}>
                        {showRemovePaymentMethodButton && (
                            <DisableOneClickConfirmation
                                id={disableConfirmationId}
                                open={this.state.showDisableStoredPaymentMethodConfirmation}
                                onDisable={this.onDisableStoredPaymentMethod}
                                onCancel={this.toggleDisableConfirmation}
                            />
                        )}

                        <PaymentMethodDetails paymentMethodComponent={paymentMethod.render()} isLoaded={isLoaded} />
                    </div>
                </div>
            </div>
        );
    }
}

export default PaymentMethodItem;
