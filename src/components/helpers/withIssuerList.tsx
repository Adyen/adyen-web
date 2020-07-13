import { h } from 'preact';
import UIElement from '../UIElement';
import IssuerList from '../internal/IssuerList';
import getIssuerImageUrl from '../../utils/get-issuer-image';
import { FALLBACK_CONTEXT } from '../../core/config';
import CoreProvider from '../../core/Context/CoreProvider';
import Language from '../../language/Language';

interface IssuerListProps {
    showImage?: boolean;
    placeholder?: string;
    items?: IssuerItem[];
    details?: { key: string; items: IssuerItem[] };
    i18n: Language;
    loadingContext: string;
}

interface IssuerItem {
    id: string;
    name: string;
}

interface IssuerListData {
    paymentMethod: {
        type: string;
        issuer: string;
    };
}

interface WithIssuerListOptions {
    type: string;
    placeholder?: string;
    showImage?: boolean;
}

/**
 * IssuerListContainer: A higher order function which returns a different class based on issuerType
 */
const withIssuerList = ({ type, placeholder, showImage = true }: WithIssuerListOptions): any => {
    class IssuerListContainer extends UIElement {
        public static type = type;
        public props: IssuerListProps;

        constructor(props: IssuerListProps) {
            super(props);

            if (this.props.showImage) {
                const getIssuerIcon = getIssuerImageUrl({ loadingContext: this.props.loadingContext }, IssuerListContainer.type);

                this.props.items = this.props.items.map(item => ({
                    ...item,
                    icon: getIssuerIcon(item.id)
                }));
            }
        }

        protected static defaultProps = {
            showImage,
            onValid: () => {},
            items: [],
            loadingContext: FALLBACK_CONTEXT
        };

        /**
         * Formats props on construction time
         */
        formatProps(props) {
            return {
                ...props,
                items: props.details && props.details.length ? (props.details.find(d => d.key === 'issuer') || {}).items : props.items
            };
        }

        /**
         * Formats the component data output
         */
        formatData(): IssuerListData {
            return {
                paymentMethod: {
                    type: IssuerListContainer.type,
                    issuer: this.state.issuer
                }
            };
        }

        /**
         * Returns whether the component state is valid or not
         */
        get isValid() {
            return !!this.state && !!this.state.issuer;
        }

        render() {
            return (
                <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                    <IssuerList
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        {...this.props}
                        {...this.state}
                        onChange={this.setState}
                        onSubmit={this.submit}
                        placeholder={placeholder}
                        payButton={this.payButton}
                    />
                </CoreProvider>
            );
        }
    }

    return IssuerListContainer;
};

export default withIssuerList;
