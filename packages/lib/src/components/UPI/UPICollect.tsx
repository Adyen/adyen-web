import { h, RefObject } from 'preact';
import UIElement from '../UIElement';
import CoreProvider from '../../core/Context/CoreProvider';
import UPIComponent from './components/UPIComponent';
import Await from '../internal/Await';
import config from './config';

class UPICollect extends UIElement {
    public static type = 'upi_collect';

    constructor(props: any) {
        super(props);
        this.handleGenerateQrCodeClick = this.handleGenerateQrCodeClick.bind(this);
    }

    // public static defaultProps = {
    //     items: COUNTRIES.map(formatPrefixName).filter(item => item !== false),
    //     countryCode: COUNTRIES[0].code,
    //     prefixName: 'qiwiwallet.telephoneNumberPrefix' || COUNTRIES[0].id,
    //     phoneName: 'qiwiwallet.telephoneNumber' || ''
    // };

    get isValid() {
        return !!this.state.isValid;
    }

    // formatProps(props) {
    //     return {
    //         onValid: () => {},
    //         ...props,
    //         selected: selectItem(props.items, props.countryCode)
    //     };
    // }

    formatData() {
        const { virtualPaymentAddress } = this.state.data;
        return {
            paymentMethod: {
                type: UPICollect.type,
                ...(virtualPaymentAddress && { virtualPaymentAddress })
                // vpa
            }
        };
    }

    private handleGenerateQrCodeClick(): void {
        this.setState({ data: {}, valid: {}, errors: {}, isValid: true });
        this.submit();
    }

    render() {
        console.log(this);

        if (this.props.paymentData && this.props.type === 'await') {
            return (
                <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                    <Await
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        clientKey={this.props.clientKey}
                        paymentData={this.props.paymentData}
                        onError={this.handleError}
                        onComplete={this.onComplete}
                        brandLogo={this.icon}
                        type={config.type}
                        messageText={this.props.i18n.get(config.messageTextId)}
                        awaitText={this.props.i18n.get(config.awaitTextId)}
                        showCountdownTimer={config.showCountdownTimer}
                        delay={config.STATUS_INTERVAL}
                        countdownTime={config.COUNTDOWN_MINUTES}
                        throttleTime={config.THROTTLE_TIME}
                        throttleInterval={config.THROTTLE_INTERVAL}
                    />
                </CoreProvider>
            );
        }

        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                <UPIComponent
                    ref={(ref: RefObject<typeof UPIComponent>) => {
                        this.componentRef = ref;
                    }}
                    showPayButton={this.props.showPayButton}
                    payButton={this.payButton}
                    onChange={this.setState}
                    onSubmit={this.submit}
                    onGenerateQrCodeClick={this.handleGenerateQrCodeClick}
                />
            </CoreProvider>
        );
    }
}

export default UPICollect;
