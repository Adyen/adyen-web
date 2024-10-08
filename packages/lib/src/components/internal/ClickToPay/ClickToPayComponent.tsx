import { h } from 'preact';
import { useCallback, useEffect } from 'preact/hooks';
import { CtpState } from './services/ClickToPayService';
import useClickToPayContext from './context/useClickToPayContext';
import CtPOneTimePassword from './components/CtPOneTimePassword';
import CtPCards from './components/CtPCards';
import CtPSection from './components/CtPSection';
import CtPLoader from './components/CtPLoader';
import CtPLogin from './components/CtPLogin';
import SrciError from './services/sdks/SrciError';

type ClickToPayComponentProps = {
    onDisplayCardComponent?(): void;
};

const ClickToPayComponent = ({ onDisplayCardComponent }: ClickToPayComponentProps): h.JSX.Element => {
    const { ctpState, onReady, startIdentityValidation, logoutShopper } = useClickToPayContext();

    useEffect(() => {
        if ([CtpState.OneTimePassword, CtpState.Login, CtpState.Ready].includes(ctpState)) {
            onReady();
        }
    }, [ctpState, onReady]);

    useEffect(() => {
        async function sendOneTimePassword() {
            try {
                await startIdentityValidation();
            } catch (error) {
                if (error instanceof SrciError) console.warn(`CtP - Identity Validation error: ${error.toString()}`);
                await logoutShopper();
            }
        }
        if (ctpState === CtpState.ShopperIdentified) {
            void sendOneTimePassword();
        }
    }, [ctpState]);

    /**
     * We capture the ENTER keypress within the ClickToPay component because we do not want to propagate the event up to the UIElement
     * UIElement would perform the payment flow (by calling .submit), which is not relevant/supported by Click to Pay
     */
    const handleEnterKeyPress = useCallback((event: h.JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent <form> submission if Component is placed inside a form
            event.stopPropagation(); // Prevent global BaseElement keypress event to be triggered
        }
    }, []);

    if (ctpState === CtpState.NotAvailable) {
        return null;
    }

    return (
        <CtPSection onEnterKeyPress={handleEnterKeyPress}>
            {[CtpState.Loading, CtpState.ShopperIdentified].includes(ctpState) && <CtPLoader />}
            {ctpState === CtpState.OneTimePassword && <CtPOneTimePassword onDisplayCardComponent={onDisplayCardComponent} />}
            {ctpState === CtpState.Ready && <CtPCards onDisplayCardComponent={onDisplayCardComponent} />}
            {ctpState === CtpState.Login && <CtPLogin />}
        </CtPSection>
    );
};

export default ClickToPayComponent;
