import { ComponentChildren, h } from 'preact';
import { ClickToPayContext, IClickToPayContext } from '../../context/ClickToPayContext';
import { render, screen } from '@testing-library/preact';
import { CoreProvider } from '../../../../../core/Context/CoreProvider';
import { mock } from 'jest-mock-extended';
import CtPLogin from './CtPLogin';
import userEvent from '@testing-library/user-event';
import SrciError from '../../services/sdks/SrciError';

const customRender = (children: ComponentChildren, providerProps: IClickToPayContext) => {
    return render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            { }
            <ClickToPayContext.Provider value={{ ...providerProps }} children={children} />
        </CoreProvider>
    );
};

test('should set CTP to primary payment method if shopper interacts with the login input', async () => {
    const user = userEvent.setup();

    const contextProps = mock<IClickToPayContext>();
    contextProps.isCtpPrimaryPaymentMethod = false;
    contextProps.schemes = ['mc', 'visa'];
    contextProps.setIsCtpPrimaryPaymentMethod.mockImplementation(isPrimary => {
        contextProps.isCtpPrimaryPaymentMethod = isPrimary;
    });

    const { rerender } = customRender(<CtPLogin />, contextProps);

    let button = await screen.findByRole('button', { name: 'Continue' });
    expect(button).toHaveClass('adyen-checkout__button--secondary');

    const input = await screen.findByLabelText('Email');

    await user.click(input);
    await user.keyboard('shopper@example.com');

    rerender(customRender(<CtPLogin />, contextProps));

    expect(contextProps.setIsCtpPrimaryPaymentMethod).toHaveBeenCalledWith(true);

    button = await screen.findByRole('button', { name: 'Continue' });
    expect(button).not.toHaveClass('adyen-checkout__button--secondary');
});

test('should not start the user login if the email is invalid', async () => {
    const user = userEvent.setup();

    const contextProps = mock<IClickToPayContext>();
    contextProps.isCtpPrimaryPaymentMethod = true;
    contextProps.setIsCtpPrimaryPaymentMethod.mockImplementation(() => {});
    contextProps.verifyIfShopperIsEnrolled.mockRejectedValue(
        new SrciError({ reason: 'ID_FORMAT_UNSUPPORTED', message: '' }, 'verifyIfShopperIsEnrolled', 'visa')
    );
    contextProps.schemes = ['mc', 'visa'];

    customRender(<CtPLogin />, contextProps);

    const input = await screen.findByLabelText('Email');
    await user.click(input);
    await user.keyboard('my.invalid.email@example');

    const button = await screen.findByRole('button', { name: 'Continue' });
    await user.click(button);

    expect(contextProps.startIdentityValidation).toHaveBeenCalledTimes(0);
    expect(input).toBeInvalid();
    expect(await screen.findByText('Format not supported')).toBeInTheDocument();
    expect(button).not.toHaveClass('adyen-checkout__button--loading');
});

test('should display not found if the email is not registered', async () => {
    const user = userEvent.setup();

    const contextProps = mock<IClickToPayContext>();
    contextProps.isCtpPrimaryPaymentMethod = true;
    contextProps.setIsCtpPrimaryPaymentMethod.mockImplementation(() => {});
    contextProps.verifyIfShopperIsEnrolled.mockResolvedValue({ isEnrolled: false });
    contextProps.startIdentityValidation.mockImplementation();
    contextProps.schemes = ['mc', 'visa'];

    customRender(<CtPLogin />, contextProps);

    const input = await screen.findByLabelText('Email');
    await user.click(input);
    await user.keyboard('my.invalid.email@example');

    const button = await screen.findByRole('button', { name: 'Continue' });
    await user.click(button);

    expect(contextProps.startIdentityValidation).toHaveBeenCalledTimes(0);
    expect(input).toBeInvalid();
    expect(await screen.findByText('No account found, enter a valid email or continue using manual card entry')).toBeInTheDocument();
    expect(button).not.toHaveClass('adyen-checkout__button--loading');
});

test('should start the identity validation if the user is enrolled', async () => {
    const user = userEvent.setup();

    const contextProps = mock<IClickToPayContext>();
    contextProps.isCtpPrimaryPaymentMethod = true;
    contextProps.setIsCtpPrimaryPaymentMethod.mockImplementation(() => {});
    contextProps.verifyIfShopperIsEnrolled.mockResolvedValue({ isEnrolled: true });
    contextProps.startIdentityValidation.mockImplementation();
    contextProps.schemes = ['mc', 'visa'];

    customRender(<CtPLogin />, contextProps);

    const input = await screen.findByLabelText('Email');
    await user.click(input);
    await user.keyboard('shopper@email.com');

    const button = await screen.findByRole('button', { name: 'Continue' });
    await user.click(button);

    expect(contextProps.startIdentityValidation).toHaveBeenCalledTimes(1);
    expect(button).toHaveClass('adyen-checkout__button--loading');
});
