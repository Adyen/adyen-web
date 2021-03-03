import { h } from 'preact';
import UIElement from '../UIElement';
import PersonalDetails from '../internal/PersonalDetails';
import CoreProvider from '../../core/Context/CoreProvider';

export class PersonalDetailsElement extends UIElement {
    get data() {
        return { ...this.state.data };
    }

    get isValid() {
        return !!this.state.isValid;
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                <PersonalDetails
                    ref={ref => {
                        this.componentRef = ref;
                    }}
                    {...this.props}
                    onChange={this.setState}
                />
            </CoreProvider>
        );
    }
}

export default PersonalDetailsElement;
