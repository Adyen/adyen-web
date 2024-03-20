import { Fragment, h } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import useClickToPayContext from '../../internal/ClickToPay/context/useClickToPayContext';
import { CtpState } from '../../internal/ClickToPay/services/ClickToPayService';
import ClickToPayComponent from '../../internal/ClickToPay';
import ContentSeparator from '../../internal/ContentSeparator';
import Button from '../../internal/Button';
import useCoreContext from '../../../core/Context/useCoreContext';
import { Status } from '../../internal/BaseElement/types';

type ClickToPayWrapperProps = {
    children(isCardPrimaryInput?: boolean): h.JSX.Element;
};

const ClickToPayHolder = ({ children }: ClickToPayWrapperProps) => {
    const { i18n } = useCoreContext();
    const [isCardInputVisible, setIsCardInputVisible] = useState<boolean>(null);
    const { ctpState, isCtpPrimaryPaymentMethod, setIsCtpPrimaryPaymentMethod, status } = useClickToPayContext();

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

    if (ctpState === CtpState.NotAvailable) {
        return children();
    }

    if (ctpState === CtpState.Loading || ctpState === CtpState.ShopperIdentified) {
        return <ClickToPayComponent />;
    }

    return (
        <Fragment>
            <ClickToPayComponent onDisplayCardComponent={handleOnShowCardButtonClick} />

            <ContentSeparator classNames={['adyen-checkout-ctp__separator']} label={i18n.get('ctp.separatorText')} />

            {isCardInputVisible ? (
                children(!isCtpPrimaryPaymentMethod)
            ) : (
                <Button
                    variant="secondary"
                    disabled={status === Status.Loading}
                    label={i18n.get('ctp.manualCardEntry')}
                    onClick={handleOnShowCardButtonClick}
                />
            )}
        </Fragment>
    );
};

export default ClickToPayHolder;
