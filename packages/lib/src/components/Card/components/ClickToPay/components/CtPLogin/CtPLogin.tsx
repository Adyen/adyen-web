import { Fragment, h } from 'preact';
import Button from '../../../../../internal/Button';
import useClickToPayContext from '../../context/useClickToPayContext';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import CtPLoginInput, { CtPLoginInputHandlers } from './CtPLoginInput';
import { useCallback, useRef, useState } from 'preact/hooks';
import './CtPLogin.scss';

const CtPLogin = (): h.JSX.Element => {
    const { i18n } = useCoreContext();
    const { isCtpPrimaryPaymentMethod, setIsCtpPrimaryPaymentMethod, verifyIfShopperIsEnrolled, startIdentityValidation } = useClickToPayContext();
    const [shopperLogin, setShopperLogin] = useState<string>(null);
    const [isValid, setIsValid] = useState<boolean>(false);
    const [errorCode, setErrorCode] = useState<string>(null);
    const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
    const inputRef = useRef<CtPLoginInputHandlers>(null);

    const handleOnLoginChange = useCallback(({ data, isValid }) => {
        setShopperLogin(data.shopperLogin);
        setIsValid(isValid);

        // As soon as the Shopper interacts with input, the CtP becomes the primary PM
        if (data?.shopperLogin?.length > 0) {
            setIsCtpPrimaryPaymentMethod(true);
        }
    }, []);

    const handleOnLoginButtonClick = useCallback(async () => {
        setErrorCode(null);

        if (!isValid) {
            inputRef.current.validateInput();
            return;
        }

        setIsLoggingIn(true);

        try {
            const { isEnrolled } = await verifyIfShopperIsEnrolled(shopperLogin);
            if (isEnrolled) {
                await startIdentityValidation();
            } else {
                setErrorCode('NOT_FOUND');
                setIsLoggingIn(false);
            }
        } catch (error) {
            setErrorCode(error?.reason);
            setIsLoggingIn(false);
        }
    }, [verifyIfShopperIsEnrolled, startIdentityValidation, shopperLogin, isValid, inputRef.current]);

    return (
        <Fragment>
            <div className="adyen-checkout-ctp__login-title">{i18n.get('ctp.login.title')}</div>
            <div className="adyen-checkout-ctp__login-subtitle">{i18n.get('ctp.login.subtitle')}</div>
            <CtPLoginInput
                ref={inputRef}
                onChange={handleOnLoginChange}
                disabled={isLoggingIn}
                errorMessage={errorCode && i18n.get(`ctp.errors.${errorCode}`)}
                onPressEnter={handleOnLoginButtonClick}
            />
            <Button
                label={i18n.get('continue')}
                variant={isCtpPrimaryPaymentMethod ? 'primary' : 'secondary'}
                onClick={handleOnLoginButtonClick}
                status={isLoggingIn && 'loading'}
            />
        </Fragment>
    );
};

export default CtPLogin;
