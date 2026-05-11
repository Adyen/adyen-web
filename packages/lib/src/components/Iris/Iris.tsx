import { h } from 'preact';
import isMobile from '../../utils/isMobile';
import IssuerListContainer from '../helpers/IssuerListContainer/IssuerListContainer';
import { QRLoader } from '../internal/QRLoader';
import { TxVariants } from '../tx-variants';
import IrisComponent from './components/IrisComponent';
import { IrisQrCodeInstructions } from './components/IrisQrCodeInstructions';
import { IrisConfiguration, IrisData, IrisMode, IrisState } from './types';
import { DEFAULT_IRIS_COUNTDOWN_TIME } from './constants';

const defaultMode = isMobile() ? IrisMode.BANK_LIST : IrisMode.QR_CODE;

export class Iris extends IssuerListContainer<IrisConfiguration, IrisData> {
    public static readonly type = TxVariants.iris;

    public state: IrisState = {
        isValid: defaultMode === IrisMode.QR_CODE,
        mode: defaultMode,
        data: {}
    };

    private renderIssuerList(): h.JSX.Element {
        return super.componentToRender();
    }

    formatData(): IrisData {
        if (this.state.mode === IrisMode.BANK_LIST) {
            return {
                paymentMethod: {
                    type: this.type,
                    issuer: this.state?.data?.issuer
                }
            };
        }

        return {
            paymentMethod: {
                type: this.type
            }
        };
    }

    formatProps(props: IrisConfiguration): IrisConfiguration {
        return {
            ...super.formatProps(props),
            countdownTime: props.countdownTime ?? DEFAULT_IRIS_COUNTDOWN_TIME
        };
    }

    get isValid() {
        if (this.state.mode === IrisMode.BANK_LIST) {
            return super.isValid;
        }

        return true;
    }

    protected override componentToRender(): h.JSX.Element {
        if (this.props.type === 'qrCode') {
            return (
                <QRLoader
                    type={TxVariants.iris}
                    brandLogo={this.icon}
                    clientKey={this.props.clientKey}
                    qrCodeData={this.props.qrCodeData ? encodeURIComponent(this.props.qrCodeData) : undefined}
                    countdownTime={this.props.countdownTime}
                    paymentData={this.props.paymentData}
                    delay={this.props.delay}
                    onActionHandled={this.onActionHandled}
                    onError={this.props.onError}
                    onComplete={this.onComplete}
                    introduction={IrisQrCodeInstructions}
                    showAmount
                    copyBtn={false}
                />
            );
        }

        return (
            <IrisComponent
                setComponentRef={this.setComponentRef}
                defaultMode={this.state.mode}
                onUpdateMode={mode => {
                    this.setState({ mode });
                }}
                issuerListUI={this.renderIssuerList()}
                showPayButton={this.props.showPayButton}
                payButton={this.payButton}
                issuers={this.props.issuers || []}
            />
        );
    }
}

export default Iris;
