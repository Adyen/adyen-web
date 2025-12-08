import { h } from 'preact';
import IssuerListContainer from '../helpers/IssuerListContainer/IssuerListContainer';
import { TxVariants } from '../tx-variants';
import { QRLoader } from '../internal/QRLoader';

export class Iris extends IssuerListContainer {
    public static readonly type = TxVariants.iris;

    private renderIssuerList(): h.JSX.Element {
        return super.componentToRender();
    }

    protected override componentToRender(): h.JSX.Element {
        const { type } = this.props;

        if (type === 'qrCode') {
            return (
                <QRLoader
                    {...this.props}
                    qrCodeData={this.props.qrCodeData ? encodeURIComponent(this.props.qrCodeData) : null}
                    type={TxVariants.iris}
                    brandLogo={this.icon}
                    onComplete={this.onComplete}
                    introduction={this.props.i18n.get('upi.qrCodeWaitingMessage')}
                    countdownTime={30}
                    onActionHandled={this.onActionHandled}
                />
            );
        }

        return this.renderIssuerList();
    }
}

export default Iris;
