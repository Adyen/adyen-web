import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import { CoreProvider } from '../../core/Context/CoreProvider';
import PayButton from '../internal/PayButton';
import { KlarnaContainer } from './components/KlarnaContainer/KlarnaContainer';
import { TxVariants } from '../tx-variants';
import type { KlarnaAction, KlarnaAdditionalDetailsData, KlarnaComponentRef, KlarnaConfiguration } from './types';
import type { ICore } from '../../core/types';
import { PayButtonFunctionProps } from '../internal/UIElement/types';

class KlarnaPayments extends UIElement<KlarnaConfiguration> {
    public static type = TxVariants.klarna;
    public static txVariants = [TxVariants.klarna, TxVariants.klarna_account, TxVariants.klarna_paynow, TxVariants.klarna_b2b];

    public componentRef: KlarnaComponentRef;

    protected static defaultProps = {
        useKlarnaWidget: false
    };

    constructor(checkout: ICore, props?: KlarnaConfiguration) {
        super(checkout, props);

        this.onComplete = this.onComplete.bind(this);
        this.updateWithAction = this.updateWithAction.bind(this);
        this.submit = this.submit.bind(this);
        this.onLoaded = this.onLoaded.bind(this);
    }
    get isValid() {
        return true;
    }

    protected formatData() {
        return {
            paymentMethod: {
                type: this.type,
                ...(this.props.useKlarnaWidget ? { subtype: 'sdk' } : {})
            }
        };
    }

    public payButton = (props: PayButtonFunctionProps) => {
        return <PayButton amount={this.props.amount} onClick={this.submit} {...props} />;
    };

    public override handleAction(action: KlarnaAction, props = {}): UIElement | null {
        if (action.type === 'sdk') {
            this.updateWithAction(action);
            return;
        }
        return super.handleAction(action, props);
    }

    updateWithAction(action: KlarnaAction): void {
        if (action.paymentMethodType !== this.type) throw new Error('Invalid Action');
        this.componentRef.setAction(action);
    }

    private onLoaded() {
        // When action/widget is loaded, set the 'drop-in' back to ready
        this.setElementStatus('ready');
    }

    public override activate() {
        this.componentRef.reinitializeWidget();
    }

    protected onComplete(details: KlarnaAdditionalDetailsData): void {
        this.handleAdditionalDetails(details);
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources} analytics={this.analytics}>
                <KlarnaContainer
                    {...this.props}
                    setComponentRef={this.setComponentRef}
                    displayName={this.displayName}
                    onComplete={this.onComplete}
                    onError={this.props.onError}
                    payButton={this.payButton}
                    onLoaded={this.onLoaded}
                    showPayButton={this.props.showPayButton}
                    onActionHandled={this.onActionHandled}
                    type={this.props.type}
                />
            </CoreProvider>
        );
    }
}

export default KlarnaPayments;
