import { h } from 'preact';
import UIElement from '../UIElement';
import CoreProvider from '../../core/Context/CoreProvider';
import DonationComponent from './components/DonationComponent';
import { TxVariants } from '../tx-variants';
import { UIElementProps } from '../types';

interface DonationProps extends UIElementProps {
    onDonate(data: any, component: DonationElement): void;
}

/**
 * DonationElement
 */
class DonationElement extends UIElement<DonationProps> {
    public static type = TxVariants.donation;

    constructor(props) {
        super(props);
        this.donate = this.donate.bind(this);
    }

    public static defaultProps = {
        onCancel: () => {},
        onDonate: () => {}
    };

    /**
     * Returns the component payment data ready to submit to the Checkout API
     */
    get data() {
        return this.state.data;
    }

    /**
     * Returns whether the component state is valid or not
     */
    get isValid() {
        return this.state.isValid;
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
    }

    donate() {
        const { data, isValid } = this;
        this.props.onDonate({ data, isValid }, this);
    }

    public handleRef = ref => {
        this.componentRef = ref;
    };

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                {/* @ts-ignore ref handled by Preact internally */}
                <DonationComponent {...this.props} ref={this.handleRef} onChange={this.setState} onDonate={this.donate} />
            </CoreProvider>
        );
    }
}

export default DonationElement;
