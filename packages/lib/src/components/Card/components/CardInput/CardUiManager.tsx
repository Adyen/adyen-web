import { h } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import useClickToPayContext from '../ClickToPay/context/useClickToPayContext';
import { CtpState } from '../ClickToPay/services/ClickToPayService';

type Props = {
    children: any;
};

const CardUiManager = ({ children }: Props): h.JSX.Element => {
    const [isCardInputVisible, setIsCardInputVisible] = useState<boolean>(null);
    const { ctpState, isCtpPrimaryPaymentMethod, setIsCtpPrimaryPaymentMethod } = useClickToPayContext();

    const areFieldsNotSet = isCardInputVisible === null && isCtpPrimaryPaymentMethod === null;

    useEffect(() => {
        if (areFieldsNotSet) {
            if (ctpState === CtpState.ShopperIdentified || ctpState === CtpState.Ready) {
                setIsCardInputVisible(false);
                setIsCtpPrimaryPaymentMethod(true);
                return;
            }
            if (ctpState === CtpState.NotAvailable) {
                setIsCardInputVisible(true);
                setIsCtpPrimaryPaymentMethod(false);
            }
        }
    }, [ctpState, areFieldsNotSet]);

    const handleOnShowCardButtonClick = useCallback(() => {
        setIsCardInputVisible(true);
        setIsCtpPrimaryPaymentMethod(false);
    }, []);

    return (
        <div>
            {children({
                ctpState,
                isCardInputVisible,
                isCardPrimaryInput: !isCtpPrimaryPaymentMethod,
                makeCardInputVisible: handleOnShowCardButtonClick
            })}
        </div>
    );
};

export default CardUiManager;
