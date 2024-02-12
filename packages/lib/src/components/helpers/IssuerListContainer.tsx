import { h } from 'preact';
import UIElement from '../UIElement';
import { UIElementProps } from '../types';
import IssuerList from '../internal/IssuerList';
import getIssuerImageUrl from '../../utils/get-issuer-image';
import { FALLBACK_CONTEXT } from '../../core/config';
import CoreProvider from '../../core/Context/CoreProvider';
import Language from '../../language/Language';
import { IssuerItem, TermsAndConditions } from '../internal/IssuerList/types';
import RedirectButton from '../internal/RedirectButton';
import SRPanelProvider from '../../core/Errors/SRPanelProvider';
import { SendAnalyticsObject } from '../../core/Analytics/types';

interface IssuerListContainerProps extends UIElementProps {
    showImage?: boolean;
    placeholder?: string;
    issuers?: IssuerItem[];
    highlightedIssuers: string[];
    i18n: Language;
    loadingContext: string;
    showPaymentMethodItemImages?: boolean;
    showPayButton?: boolean;
    termsAndConditions?: TermsAndConditions;
}

interface IssuerListData {
    paymentMethod: {
        type: string;
        issuer: string;
    };
}

class IssuerListContainer extends UIElement<IssuerListContainerProps> {
    constructor(props: IssuerListContainerProps) {
        super(props);

        const getImage = props => this.resources.getImage(props);

        if (this.props.showImage) {
            const getIssuerIcon = getIssuerImageUrl({ loadingContext: this.props.loadingContext }, this.constructor['type'], getImage);

            this.props.issuers = this.props.issuers.map(item => ({
                ...item,
                icon: getIssuerIcon(item.id)
            }));
        }
    }

    protected static defaultProps = {
        showImage: true,
        onValid: () => {},
        issuers: [],
        highlightedIssuers: [],
        loadingContext: FALLBACK_CONTEXT,
        showPaymentMethodItemImages: false,
        // Previously we didn't check the showPayButton before rendering the RedirectButton.
        // Now that we are checking it, all the merchants who don't specify showPayButton in the config will not see the RedirectButton anymore.
        // To prevent the backward compatible issue, we add it as the default prop, but it should be fixed properly on v6.
        showPayButton: true
    };

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
                type: this.constructor['type'],
                issuer: this.state?.data?.issuer
            }
        };
    }

    protected submitAnalytics = (aObj: SendAnalyticsObject) => {
        super.submitAnalytics(aObj);
    };

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
                            onSubmitAnalytics={this.submitAnalytics}
                        />
                    </SRPanelProvider>
                ) : (
                    this.props.showPayButton && (
                        <RedirectButton
                            name={this.props.name}
                            {...this.props}
                            onSubmit={this.submit}
                            payButton={this.payButton}
                            ref={ref => {
                                this.componentRef = ref;
                            }}
                        />
                    )
                )}
            </CoreProvider>
        );
    }
}

export default IssuerListContainer;
