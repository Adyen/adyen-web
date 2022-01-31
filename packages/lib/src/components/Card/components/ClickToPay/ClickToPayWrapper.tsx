import { h } from 'preact';
import useClickToPay from './useClickToPay';
import { Status } from '../../../internal/ClickToPay/ClickToPayService';

interface IClickToPayWrapper {
    schemas: Array<string>;
    shopperIdentity?: { value: string; type: string };
}

const ClickToPayWrapper = ({ schemas, shopperIdentity }: IClickToPayWrapper) => {
    const { status } = useClickToPay({ schemas, shopperIdentity });

    console.log(status);

    // Next steps:
    //         // - Figure out what happens if one sdk is good but other isn'nt
    //         // - In the meantime, do the flow where user is not recognized and doesn't exist
    //         // - and wait for end version of designs to start UI

    // if schemas are passed here, then we start the SDK
    // -> Perform the Adyen API request to get the init params
    // -> init()
    // -> isRecognized():
    // ->   user is recognized ->
    // -        show cards: getSrcProfile()
    // ->   user isn't recognized:
    //          if email provided, IdentityLookup()
    //              if user exist, show sign-in button
    //              else don't show anything
    //          else don't show anything

    if (status === Status.NotAvailable || status === Status.Loading) {
        return null;
    }

    if (status === Status.Ready) {
        return <div>Click to pay: select CARD</div>;
    }

    return <div>Sign in click-to-pay</div>;
};

export default ClickToPayWrapper;
