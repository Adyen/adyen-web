import { h } from 'preact';
import AwaitLogoContainer, { IAwaitLogoContainer } from './AwaitLogoContainer';
import Await from '../../../../internal/Await';
import './PayBankBankPixAwait.scss';
import { AwaitComponentProps } from '../../../../internal/Await/types';

export interface IPayByBankPixAwait extends Partial<AwaitComponentProps>, Partial<IAwaitLogoContainer> {}

function PayByBankPixAwait(props: IPayByBankPixAwait) {
    return (
        <div className={'adyen-checkout-pay-by-bank-pix-await'}>
            {props.logos?.length > 0 && <AwaitLogoContainer logos={props.logos}></AwaitLogoContainer>}
            <Await
                // We want the countdown capability but the adyen-checkout__await__countdown-holder is visually hidden.
                showCountdownTimer={true}
                type={props.type}
                countdownTime={props.countdownTime}
                clientKey={props.clientKey}
                onError={props.onError}
                awaitText={props.awaitText}
                instructions={props.instructions}
                pollStatus={props.pollStatus}
                endSlot={props.endSlot}
            ></Await>
        </div>
    );
}

export default PayByBankPixAwait;
