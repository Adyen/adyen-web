import { h } from 'preact';
import UIElement from '../internal/UIElement';
import { CoreProvider } from '../../core/Context/CoreProvider';
import { TxVariants } from '../tx-variants';
import { UIElementProps } from '../internal/UIElement/types';
import FastlaneComponent from './components/FastlaneComponent';

interface FastlaneConfiguration extends UIElementProps {
    tokenId: string;
    customerId: string;
    lastFour: string;
    brand: string;
    email: string;
    sessionId: string;
    /**
     * List of brands accepted by the component
     * @internal
     */
    brands?: string[];
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

    protected static defaultProps = {
        keepBrandsVisible: true
    };

    protected override formatData() {
        return {
            paymentMethod: {
                type: Fastlane.type,
                fastlaneData: btoa(
                    JSON.stringify({
                        sessionId: this.props.sessionId,
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

    public override get icon(): string {
        return this.props.icon ?? this.resources.getImage()('card');
    }

    public get brands(): { icon: string; name: string }[] {
        const { brands } = this.props;
        return brands.map(brand => ({ icon: this.props.modules.resources.getImage()(brand), name: brand }));
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                <FastlaneComponent
                    lastFour={this.props.lastFour}
                    brand={this.props.brand}
                    payButton={this.payButton}
                    setComponentRef={this.setComponentRef}
                    showPayButton={this.props.showPayButton}
                />
            </CoreProvider>
        );
    }
}

export default Fastlane;
