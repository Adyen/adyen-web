import { h } from 'preact';
import useClickToPay from '../../services/useClickToPay';
import { CtpState } from '../../services/ClickToPayService';
import { useCallback, useState } from 'preact/hooks';

const buttonStyle = {
    width: '100%',
    height: '40px',
    backgroundColor: 'white',
    border: 'none',
    borderRadius: '4px',
    marginBottom: '20px',
    boxShadow: '0 0 0 2px #999595',
    cursor: 'pointer'
};

interface IClickToPayWrapper {
    environment: string;
    schemas: Array<string>;
    shopperIdentity?: { value: string; type: string };
}

/**
 * TODO:
 * Scenarios to think:
 * - CtP Card is selected , then shopper focus on credit card field and type something. What happens?
 * - Credit card data is entered by shopper. Then shopper goes and clicks on CtP available card. What happens?
 * - When getSrcProfile returns multiple profiles? Is it when there are multiple schemas?
 */

const ClickToPayWrapper = ({ schemas, shopperIdentity, environment }: IClickToPayWrapper) => {
    const { status, cards, doCheckout, startIdentityValidation, cancelIdentityValidation, finishIdentityValidation } = useClickToPay({
        schemas,
        shopperIdentity,
        environment
    });
    const [otp, setOtp] = useState<string>('');
    const [maskedData, setMaskedData] = useState<string>('');

    const onSignInClick = useCallback(async () => {
        const data = await startIdentityValidation();
        setMaskedData(data.maskedValidationChannel);
    }, [startIdentityValidation]);

    switch (status) {
        case CtpState.Loading: {
            return (
                <div
                    style={{
                        width: '100%',
                        height: '40px',
                        backgroundColor: 'grey',
                        borderRadius: '4px',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}
                >
                    Loading CTP Visa SDK...
                </div>
            );
        }
        case CtpState.OneTimePassword:
        case CtpState.AwaitingSignIn: {
            return (
                <div>
                    {status === CtpState.OneTimePassword && (
                        // TODO: be a modal
                        <div>
                            <div>Sent to {maskedData}</div>
                            <input type="text" onChange={(e: h.JSX.TargetedEvent<HTMLInputElement>) => setOtp(e.currentTarget.value)} />
                            <button style={buttonStyle} onClick={() => finishIdentityValidation(otp)}>
                                Submit OTP
                            </button>
                            <button style={buttonStyle} onClick={cancelIdentityValidation}>
                                Cancel OTP
                            </button>
                        </div>
                    )}
                    {status === CtpState.AwaitingSignIn && (
                        <button style={buttonStyle} onClick={onSignInClick}>
                            Sign in click-to-pay
                        </button>
                    )}
                </div>
            );
        }

        case CtpState.Ready: {
            return (
                <div>
                    <div>Click to pay: select CARD</div>
                    {cards?.map((card, index) => (
                        <button key={index} style={buttonStyle} onClick={() => doCheckout(card.srcDigitalCardId)}>
                            {`XXXX XXXX XXXX ${card.panLastFour} ${card.panExpirationMonth}/${card.panExpirationYear}`}
                        </button>
                    ))}
                </div>
            );
        }

        case CtpState.NotAvailable:
        default:
            return null;
    }
};

export default ClickToPayWrapper;
