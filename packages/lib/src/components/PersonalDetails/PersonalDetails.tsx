import { h } from 'preact';
import UIElement from '../UIElement';
import PersonalDetails from '../internal/PersonalDetails';
import CoreProvider from '../../core/Context/CoreProvider';

import TestContextApp from './TestContextApp';

export class PersonalDetailsElement extends UIElement {
    get data() {
        return this.state.data;
    }

    get isValid() {
        return !!this.state.isValid;
    }

    public setComponentRef = ref => {
        this.componentRef = ref;
    };

    render() {
        return (
            <CoreProvider
                i18n={this.props.i18n}
                loadingContext={this.props.loadingContext}
                commonProps={{
                    moveFocusOnSubmitErrors: this.props.moveFocusOnSubmitErrors,
                    srPanelID: 'personalDetailsErrors'
                }}
            >
                <PersonalDetails setComponentRef={this.setComponentRef} {...this.props} onChange={this.setState} />
            </CoreProvider>
        );
    }
}

export default PersonalDetailsElement;
