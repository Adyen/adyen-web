import { h } from 'preact';
import UIElement from '../UIElement';
import CoreProvider from '../../core/Context/CoreProvider';
import DonationComponent from './components/DonationComponent';
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

    protected formatProps(props: DonationElementProps) {
        if (this.isNewDonation(props)) {
            const { bannerUrl, nonprofitDescription, nonprofitName, nonprofitUrl, termsAndConditionsUrl, ...rest } =
                props as NewDonationComponentProps;

            return {
                ...rest,
                backgroundUrl: bannerUrl,
                description: nonprofitDescription,
                name: nonprofitName,
                url: nonprofitUrl,
                disclaimerMessage: {
                    message: 'By donating you agree to the %{linkText} ',
                    linkText: 'terms and conditions',
                    link: termsAndConditionsUrl
                }
            };
        }

        return props;
    }

    isNewDonation(prop: DonationElementProps): boolean {
        return Object.keys(prop).some(key => key.includes('nonprofit') && prop[key]);
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
        // @ts-ignore fixed in v6
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
