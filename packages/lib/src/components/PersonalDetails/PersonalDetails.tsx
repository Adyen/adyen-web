import { h } from 'preact';
import UIElement from '../UIElement';
import PersonalDetails from '../internal/PersonalDetails';
import CoreProvider from '../../core/Context/CoreProvider';

export class PersonalDetailsElement extends UIElement {
    get data() {
        return this.state.data;
    }

    get isValid() {
        return !!this.state.isValid;
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
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
