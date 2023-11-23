import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import PersonalDetails from '../internal/PersonalDetails';
import CoreProvider from '../../core/Context/CoreProvider';
import { TxVariants } from '../tx-variants';
import FormInstruction from '../internal/FormInstruction';
import { UIElementProps } from '../internal/UIElement/types';

interface PersonalDetailsConfiguration extends UIElementProps {
    showFormInstruction?: boolean;
}

export class PersonalDetailsElement extends UIElement<PersonalDetailsConfiguration> {
    public static type = TxVariants.personal_details;

    protected static defaultProps = {
        showFormInstruction: true
    };

    get data() {
        return this.state.data;
    }

    get isValid() {
        return !!this.state.isValid;
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                {this.props.showFormInstruction && <FormInstruction />}
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
