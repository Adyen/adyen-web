import { h } from 'preact';
import UIElement from '../UIElement';
import PersonalDetails from '../internal/PersonalDetails';
import CoreProvider from '../../core/Context/CoreProvider';
import { TxVariants } from '../tx-variants';

export class PersonalDetailsElement extends UIElement {
    public static type = TxVariants.personal_details;

    get data() {
        return this.state.data;
    }

    get isValid() {
        return !!this.state.isValid;
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                <PersonalDetails
                    setComponentRef={this.setComponentRef}
                    {...this.props}
                    onChange={this.setState}
                    {...(process.env.NODE_ENV !== 'production' && { payButton: this.payButton })}
                />
            </CoreProvider>
        );
    }
}

export default PersonalDetailsElement;
