import { Component, h } from 'preact';
import classNames from 'classnames';
import PaymentMethodDetails from './PaymentMethodDetails';
import PaymentMethodIcon from './PaymentMethodIcon';
import DisableOneClickConfirmation from './DisableOneClickConfirmation';
import styles from '../DropinComponent.module.scss';
import './PaymentMethodItem.scss';
import useCoreContext from '../../../../core/Context/useCoreContext';
import UIElement from '../../../UIElement';

interface PaymentMethodItemProps {
    paymentMethod: UIElement;
    isSelected: boolean;
    isLoaded: boolean;
    isLoading: boolean;
    isDisabling: boolean;
    showRemovePaymentMethodButton: boolean;
    onDisableStoredPaymentMethod: (paymentMethod) => void;
    onSelect: () => void;
    standalone: boolean;
    className?: string;
}

class PaymentMethodItem extends Component<PaymentMethodItemProps> {
    public static defaultProps = {
        paymentMethod: null,
        isSelected: false,
        isLoaded: false,
        isLoading: false,
        showDisableStoredPaymentMethodConfirmation: false,
        onSelect: () => {}
    };

    public state = {
        showDisableStoredPaymentMethodConfirmation: false
    };

    public isMouseDown = false;
    public onFocus = () => {
        // Prevent a focus event when the user is clicking with a mouse.
        // TODO find a solution where we can remove this if-clause (and just call this.props.onSelect()) so that the screenreader reads the same "stored card ends in..." message for clicking on a PM as it does when tabbing between them
        if (!this.isMouseDown) {
            this.props.onSelect();
        }
    };

    public onMouseDown = () => {
        this.isMouseDown = true;
    };

    public onMouseUp = () => {
        this.isMouseDown = false;
    };

    componentDidMount() {
        this.props.paymentMethod.eventEmitter.on('brand', e => {
            this.setState({ activeBrand: e.brand });
        });
    }

    componentWillUnmount() {
        this.props.paymentMethod.eventEmitter.off('brand', e => {
            this.setState({ activeBrand: e.brand });
        });
    }

    public toggleDisableConfirmation = () => {
        this.setState({ showDisableStoredPaymentMethodConfirmation: !this.state.showDisableStoredPaymentMethodConfirmation });
    };

    public onDisableStoredPaymentMethod = () => {
        this.props.onDisableStoredPaymentMethod(this.props.paymentMethod);
        this.toggleDisableConfirmation();
    };

    render({ paymentMethod, isSelected, isDisabling, isLoaded, isLoading, onSelect, standalone }, { activeBrand = null }) {
        const { i18n } = useCoreContext();

        if (!paymentMethod) {
            return null;
        }

        const paymentMethodClassnames = classNames({
            'adyen-checkout__payment-method': true,
            [styles['adyen-checkout__payment-method']]: true,
            [`adyen-checkout__payment-method--${paymentMethod.props.type}`]: true,
            'adyen-checkout__payment-method--selected': isSelected,
            [styles['adyen-checkout__payment-method--selected']]: isSelected,
            'adyen-checkout__payment-method--loading': isLoading,
            'adyen-checkout__payment-method--disabling': isDisabling,
            'adyen-checkout__payment-method--confirming': this.state.showDisableStoredPaymentMethodConfirmation,
            'adyen-checkout__payment-method--standalone': standalone,
            [styles['adyen-checkout__payment-method--loading']]: isLoading,
            [paymentMethod.props.id]: true,
            [this.props.className]: true
        });

        const showRemovePaymentMethodButton = this.props.showRemovePaymentMethodButton && paymentMethod.props.oneClick && isSelected;
        const disableConfirmationId = `remove-${paymentMethod.props.id}`;
        const showBrands = !paymentMethod.props.oneClick && paymentMethod.brands && paymentMethod.brands.length > 0;

        return (
            <li
                key={paymentMethod.props.id}
                className={paymentMethodClassnames}
                onFocus={this.onFocus}
                onClick={onSelect}
                onMouseDown={this.onMouseDown}
                onMouseUp={this.onMouseUp}
                tabIndex={isLoading ? -1 : 0}
            >
                <div className="adyen-checkout__payment-method__header">
                    <div className="adyen-checkout__payment-method__header__title">
                        <span
                            className={classNames({
                                'adyen-checkout__payment-method__radio': true,
                                'adyen-checkout__payment-method__radio--selected': isSelected
                            })}
                            aria-hidden="true"
                        />

                        <PaymentMethodIcon name={paymentMethod.props.name} src={paymentMethod.icon} />

                        <span
                            className={classNames({
                                'adyen-checkout__payment-method__name': true,
                                'adyen-checkout__payment-method__name--selected': isSelected
                            })}
                            aria-hidden="true"
                        >
                            {paymentMethod.displayName}
                        </span>
                    </div>

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
                        <span className="adyen-checkout__payment-method__brands">
                            {paymentMethod.brands.map(brand => (
                                <PaymentMethodIcon
                                    key={brand.name}
                                    name={brand.name}
                                    disabled={activeBrand && brand.name !== activeBrand}
                                    src={brand.icon}
                                />
                            ))}
                        </span>
                    )}
                </div>

                <div className={`adyen-checkout__payment-method__details ${styles['adyen-checkout__payment-method__details']}`}>
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
            </li>
        );
    }
}

export default PaymentMethodItem;
