import { h, Component } from 'preact';
import ClickToPayService, { CtpState } from '../../../services/ClickToPayService';
import SrcSdkLoader from '../../../services/sdks/SrcSdkLoader';
// import { configMock } from '../../../services/configMock';
import { ClickToPayContext } from './ClickToPayContext';

type ClickToPayProviderProps = {
    configuration: any;
    environment: string;
    children: any;
};

class ClickToPayProvider extends Component<ClickToPayProviderProps> {
    // console.log(configuration);

    private clickToPayService?: ClickToPayService;

    constructor(props) {
        super(props);

        if (props.configuration) {
            const { schemas, shopperIdentity } = props.configuration;
            const schemaNames = Object.keys(schemas);
            const srcSdkLoader = new SrcSdkLoader(schemaNames, props.environment);
            this.clickToPayService = new ClickToPayService(schemas, srcSdkLoader, shopperIdentity);
            this.state = { ctpState: this.clickToPayService.state };
            this.clickToPayService.subscribeOnStatusChange(status => this.setState({ ctpState: status }));
            return;
        }

        this.state = { ctpState: CtpState.NotAvailable };
    }

    async componentDidMount() {
        // if block might not be needed
        if (this.clickToPayService?.state === CtpState.Idle) {
            await this.clickToPayService.initialize();
        }
    }

    private handleFinishIdentityValidation = async (otpValue: string) => {
        try {
            await this.clickToPayService.finishIdentityValidation(otpValue);
        } catch (error) {
            console.log(error);
        }
    };

    private startIdentityValidation = async () => {
        const data = await this.clickToPayService.startIdentityValidation();
        return data;
    };

    private doCheckout = async (srcDigitalCardId: string) => {
        try {
            const payload = await this.clickToPayService.checkout(srcDigitalCardId);
            console.log(payload);
        } catch (error) {
            console.log(error);
        }
    };

    render({ children }: ClickToPayProviderProps, { ctpState }) {
        return (
            <ClickToPayContext.Provider
                value={{
                    ctpState: ctpState,
                    cards: this.clickToPayService?.maskedCards,
                    otpMaskedContact: this.clickToPayService?.maskedShopperContact,
                    doCheckout: this.doCheckout,
                    startIdentityValidation: this.startIdentityValidation,
                    onFinishIdentityValidation: this.handleFinishIdentityValidation
                }}
            >
                <ClickToPayContext.Consumer>{children}</ClickToPayContext.Consumer>
            </ClickToPayContext.Provider>
        );
    }
}

export default ClickToPayProvider;
