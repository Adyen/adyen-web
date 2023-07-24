import { h } from 'preact';
import UIElement from '../UIElement';
import EcontextInput from './components/EcontextInput';
import EcontextVoucherResult from './components/EcontextVoucherResult';
import CoreProvider from '../../core/Context/CoreProvider';

import { UIElementProps } from '../types';
import { PersonalDetailsSchema } from '../../types';

interface EcontextElementProps extends UIElementProps {
    reference?: string;
    personalDetailsRequired?: boolean;
    data?: PersonalDetailsSchema;
    showFormInstruction?: boolean;
}

export class EcontextElement extends UIElement<EcontextElementProps> {
    public static type = 'econtext';

    protected static defaultProps = {
        personalDetailsRequired: true,
        showFormInstruction: true
    };

    get isValid() {
        if (!this.props.personalDetailsRequired) {
            return true;
        }
        return !!this.state.isValid;
    }

    /**
     * Formats the component data output
     */
    formatData() {
        return {
            ...this.state.data,
            paymentMethod: {
                type: this.props.type || EcontextElement.type
            }
        };
    }

    get icon() {
        return this.resources.getImage({})(this.props.type);
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                {this.props.reference ? (
                    <EcontextVoucherResult
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        {...this.props}
                    />
                ) : (
                    <EcontextInput
                        setComponentRef={this.setComponentRef}
                        {...this.props}
                        onChange={this.setState}
                        onSubmit={this.submit}
                        payButton={this.payButton}
                    />
                )}
            </CoreProvider>
        );
    }
}

export default EcontextElement;
