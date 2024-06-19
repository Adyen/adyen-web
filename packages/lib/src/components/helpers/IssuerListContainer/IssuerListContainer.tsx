import { h } from 'preact';
import UIElement from '../../internal/UIElement/UIElement';
import IssuerList from '../../internal/IssuerList';
import getIssuerImageUrl from '../../../utils/get-issuer-image';
import { FALLBACK_CONTEXT } from '../../../core/config';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import RedirectButton from '../../internal/RedirectButton';
import SRPanelProvider from '../../../core/Errors/SRPanelProvider';
import { IssuerListConfiguration, IssuerListData } from './types';
import type { ICore } from '../../../core/types';

class IssuerListContainer extends UIElement<IssuerListConfiguration> {
    protected static defaultProps = {
        showImage: true,
        issuers: [],
        highlightedIssuers: [],
        loadingContext: FALLBACK_CONTEXT,
        showPaymentMethodItemImages: false
    };

    constructor(checkout: ICore, props?: IssuerListConfiguration) {
        super(checkout, props);

        const getImage = props => this.resources.getImage(props);

        if (this.props.showImage) {
            const getIssuerIcon = getIssuerImageUrl({ loadingContext: this.props.loadingContext }, this.constructor['type'], getImage);

            this.props.issuers = this.props.issuers.map(item => ({
                ...item,
                icon: getIssuerIcon(item.id)
            }));
        }
    }

    formatProps(props) {
        const issuers = (props.details && props.details.length && (props.details.find(d => d.key === 'issuer') || {}).items) || props.issuers || [];
        return { ...props, issuers };
    }

    /**
     * Formats the component data output
     */
    formatData(): IssuerListData {
        return {
            paymentMethod: {
                type: this.type,
                issuer: this.state?.data?.issuer
            }
        };
    }

    /**
     * Returns whether the component state is valid or not
     */
    get isValid() {
        if (this.props.issuers.length === 0) {
            return true;
        }
        return !!this.state?.isValid;
    }

    /**
     * Returns brands array (similar to card) depending on showPaymentMethodItemImages
     * This is used to show the brands in the PaymentMethodItem
     * Requires brands icons to be loaded in the payment method
     */
    get brands(): { icon: any; name: string }[] {
        if (this.props.showPaymentMethodItemImages) {
            return this.props.issuers.map(brand => {
                const brandIcon = brand.icon;
                return { icon: brandIcon, name: brand.id };
            });
        }

        return [];
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                {this.props.issuers.length > 0 ? (
                    <SRPanelProvider srPanel={this.props.modules.srPanel}>
                        <IssuerList
                            ref={ref => {
                                this.componentRef = ref;
                            }}
                            items={this.props.issuers}
                            highlightedIds={this.props.highlightedIssuers}
                            {...this.props}
                            {...this.state}
                            showImage={this.props.showImage}
                            type={this.constructor['type']}
                            onChange={this.setState}
                            onSubmit={this.submit}
                            payButton={this.payButton}
                            contextualText={this.props.i18n.get('issuerList.selectField.contextualText')}
                            onSubmitAnalytics={this.submitAnalytics}
                        />
                    </SRPanelProvider>
                ) : (
                    <RedirectButton
                        showPayButton={this.props.showPayButton}
                        name={this.props.name}
                        {...this.props}
                        onSubmit={this.submit}
                        payButton={this.payButton}
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                    />
                )}
            </CoreProvider>
        );
    }
}

export default IssuerListContainer;
