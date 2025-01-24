import { h } from 'preact';
import UIElement from '../internal/UIElement';
import { CoreProvider } from '../../core/Context/CoreProvider';
import { TxVariants } from '../tx-variants';
import FastlaneComponent from './components/FastlaneComponent';
import type { FastlaneConfiguration } from './types';

class Fastlane extends UIElement<FastlaneConfiguration> {
    public static readonly type = TxVariants.fastlane;

    protected static defaultProps = {
        keepBrandsVisible: true
    };

    protected override formatData() {
        return {
            paymentMethod: {
                type: Fastlane.type,
                fastlaneData: btoa(
                    JSON.stringify({
                        fastlaneSessionId: this.props.fastlaneSessionId,
                        tokenId: this.props.tokenId
                    })
                )
            }
        };
    }

    public override async isAvailable(): Promise<void> {
        const { tokenId, lastFour, brand, email, fastlaneSessionId } = this.props;
        if (tokenId && lastFour && brand && email && fastlaneSessionId) {
            return Promise.resolve();
        }
        return Promise.reject();
    }

    public override get isValid(): boolean {
        return true;
    }

    /**
     * Used to display payment method logo within Drop-in
     */
    public override get icon(): string {
        return this.props.icon ?? this.resources.getImage()('card');
    }

    /**
     * Used to display the payment method supported brands within Drop-in
     */
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
