import { h } from 'preact';
import UIElement from '../internal/UIElement';
import { CoreProvider } from '../../core/Context/CoreProvider';
import { TxVariants } from '../tx-variants';
import { UIElementProps } from '../internal/UIElement/types';

interface FastlaneConfiguration extends UIElementProps {
    tokenId: string;
    customerId: string;
    lastFour: string;
    brand: string;
    email: string;
    /**
     * Configuration returned by the backend
     * @internal
     */
    configuration?: {
        brands: string[];
    };
}

class Fastlane extends UIElement<FastlaneConfiguration> {
    public static type = TxVariants.fastlane;

    protected override formatData() {
        return {
            paymentMethod: {
                type: Fastlane.type,
                fastlaneData: btoa(
                    JSON.stringify({
                        tokenId: this.props.tokenId,
                        customerId: this.props.customerId
                    })
                )
            }
        };
    }

    public override async isAvailable(): Promise<void> {
        const { tokenId, customerId, lastFour, brand, email } = this.props;

        if (tokenId && customerId && lastFour && brand && email) {
            return Promise.resolve();
        }
        return Promise.reject();
    }

    public override get isValid(): boolean {
        return true;
    }

    render() {
        console.log('FASTLANE RENDER');

        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                <div> **** {this.props.lastFour} </div>
                <button>pay</button>
            </CoreProvider>
        );
    }
}

export default Fastlane;
