import { h } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import useClickToPayContext from '../ClickToPay/context/useClickToPayContext';
import { CtpState } from '../ClickToPay/services/ClickToPayService';

type CardUiManagerProps = {
    children: any;
};

const CardUiManager = ({ children }: CardUiManagerProps) => {
    const [isCardPositionedOnTop, setIsCardPositionOnTop] = useState<boolean>(null);
    const [isCardInputVisible, setIsCardInputVisible] = useState<boolean>(null);
    // const [isCardPrimaryInput, setIsCardPrimaryInput] = useState<boolean>(null);

    const { ctpState, isCtpPrimaryPaymentMethod, setIsCtpPrimaryPaymentMethod } = useClickToPayContext();

    const areFieldsNotSet = isCardPositionedOnTop === null && isCardInputVisible === null && isCtpPrimaryPaymentMethod === null;

    // useEffect(() => {
    //     if (ctpState === CtpState.NotAvailable) {
    //         setIsCardPositionOnTop(true);
    //         setIsCardInputVisible(true);
    //         setIsCardPrimaryInput(true);
    //     }
    // }, [ctpState]);

    // TODO:
    // MOVE setIsCardPrimaryInput TO CONTEXT

    useEffect(() => {
        if (areFieldsNotSet) {
            if (ctpState === CtpState.ShopperIdentified || ctpState === CtpState.Ready) {
                setIsCardPositionOnTop(false);
                setIsCardInputVisible(false);
                setIsCtpPrimaryPaymentMethod(true);
                // setIsCardPrimaryInput(false);
                return;
            }
            if (ctpState === CtpState.Login) {
                setIsCardPositionOnTop(true);
                setIsCardInputVisible(true);
                setIsCtpPrimaryPaymentMethod(false);
                // setIsCardPrimaryInput(true);
            }
        }
    }, [ctpState]);

    // useEffect(() => {
    //     if (isCardInputVisible === null && (ctpState === CtpState.Login)) {
    //         setIsCardInputVisible(true)
    //     }
    // }, [ctpState])

    const handleOnShowCardButtonClick = useCallback(() => {
        setIsCardInputVisible(true);
        setIsCtpPrimaryPaymentMethod(false);
        // setIsCardPrimaryInput(true);
    }, []);

    return (
        <div>
            {children({
                ctpState,
                isCardPositionedOnTop,
                isCardInputVisible,
                isCardPrimaryInput: !isCtpPrimaryPaymentMethod,
                showCardInput: handleOnShowCardButtonClick
            })}
        </div>
    );
};

export default CardUiManager;
