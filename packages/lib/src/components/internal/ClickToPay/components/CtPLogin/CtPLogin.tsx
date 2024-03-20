import { Fragment, h } from 'preact';
import { useCallback, useState } from 'preact/hooks';
import Button from '../../../Button';
import useClickToPayContext from '../../context/useClickToPayContext';
import CtPLoginInput, { CtPLoginInputHandlers } from './CtPLoginInput';
import { CtPInfo } from '../CtPInfo';
import CtPSection from '../CtPSection';
import SrciError from '../../services/sdks/SrciError';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import './CtPLogin.scss';
import TimeoutError from '../../errors/TimeoutError';
import { Status } from '../../../BaseElement/types';

const CtPLogin = (): h.JSX.Element => {
    const { i18n } = useCoreContext();
    const { isCtpPrimaryPaymentMethod, setIsCtpPrimaryPaymentMethod, verifyIfShopperIsEnrolled, startIdentityValidation } = useClickToPayContext();
    const [shopperLogin, setShopperLogin] = useState<string>(null);
    const [isValid, setIsValid] = useState<boolean>(false);
    const [errorCode, setErrorCode] = useState<string>(null);
    const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
    const [loginInputHandlers, setLoginInputHandlers] = useState<CtPLoginInputHandlers>(null);

    const onSetLoginInputHandlers = useCallback((handlers: CtPLoginInputHandlers) => {
        setLoginInputHandlers(handlers);
    }, []);

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
            loginInputHandlers.validateInput();
            return;
        }

        setIsLoggingIn(true);

        try {
            const { isEnrolled } = await verifyIfShopperIsEnrolled({ shopperEmail: shopperLogin });
            if (isEnrolled) {
                await startIdentityValidation();
            } else {
                setErrorCode('NOT_FOUND');
                setIsLoggingIn(false);
            }
        } catch (error) {
            if (error instanceof SrciError) console.warn(`CtP - Login error: ${error.toString()}`);
            if (error instanceof TimeoutError) console.warn(error.toString());
            setErrorCode(error?.reason);
            setIsLoggingIn(false);
        }
    }, [verifyIfShopperIsEnrolled, startIdentityValidation, shopperLogin, isValid, loginInputHandlers]);

    return (
        <Fragment>
            <CtPSection.Title endAdornment={<CtPInfo />}>{i18n.get('ctp.login.title')}</CtPSection.Title>

            <CtPSection.Text>{i18n.get('ctp.login.subtitle')}</CtPSection.Text>

            <CtPLoginInput
                onChange={handleOnLoginChange}
                onSetInputHandlers={onSetLoginInputHandlers}
                disabled={isLoggingIn}
                errorMessage={errorCode && i18n.get(`ctp.errors.${errorCode}`)}
                onPressEnter={handleOnLoginButtonClick}
            />

            <Button
                label={i18n.get('continue')}
                variant={isCtpPrimaryPaymentMethod ? 'primary' : 'secondary'}
                status={isLoggingIn && Status.Loading}
                onClick={() => {
                    void handleOnLoginButtonClick();
                }}
            />
        </Fragment>
    );
};

export default CtPLogin;
