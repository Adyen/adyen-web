import { h } from 'preact';
import UIElement from '../UIElement';
import CoreProvider from '../../core/Context/CoreProvider';
import DonationComponent from './components/DonationComponent';
import { DonationComponentProps } from './components/types';
import { DonationElementProps, NewDonationComponentProps } from './types';

/**
 * DonationElement
 */
class DonationElement extends UIElement<DonationElementProps> {
    public static type = 'donation';

    constructor(props) {
        super(props);
        this.donate = this.donate.bind(this);
    }

    public static defaultProps = {
        onCancel: () => {},
        onDonate: () => {}
    };

    protected formatProps(props: DonationElementProps): DonationComponentProps {
        if ('bannerUrl' in props) {
            const newDonation = props as NewDonationComponentProps;
            const { bannerUrl, nonprofitDescription, nonprofitName, nonprofitUrl, termsAndConditionsUrl, ...rest } = newDonation;
            return {
                ...rest,
                backgroundUrl: bannerUrl,
                description: nonprofitDescription,
                name: nonprofitName,
                url: nonprofitUrl,
                disclaimerMessage: {
                    message: '',
                    linkText: '',
                    link: termsAndConditionsUrl
                }
            };
        } else {
            // todo
        }
    }

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
                <DonationComponent {...this.props} ref={this.handleRef} onChange={this.setState} onDonate={this.donate} />
            </CoreProvider>
        );
    }
}

export default DonationElement;
