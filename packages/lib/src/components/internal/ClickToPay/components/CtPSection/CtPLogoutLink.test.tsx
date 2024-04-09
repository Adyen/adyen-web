import { ComponentChildren, h } from 'preact';
import { mock } from 'jest-mock-extended';
import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { ClickToPayContext, IClickToPayContext } from '../../context/ClickToPayContext';
import CtPLogoutLink from './CtPLogoutLink';
import { CtpState } from '../../services/ClickToPayService';
import ShopperCard from '../../models/ShopperCard';
import { CoreProvider } from '../../../../../core/Context/CoreProvider';

const customRender = (children: ComponentChildren, providerProps: IClickToPayContext) => {
    return render(
        // @ts-ignore TODO: Fix this weird complain
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            {/* eslint-disable-next-line react/no-children-prop */}
            <ClickToPayContext.Provider value={{ ...providerProps }} children={children} />
        </CoreProvider>
    );
};

test('should not render if shopper is not recognized', async () => {
    const contextProps = mock<IClickToPayContext>();
    contextProps.ctpState = CtpState.Login;

    const { container } = customRender(<CtPLogoutLink />, contextProps);

    // @ts-ignore FIX TYPES
    expect(container).toBeEmptyDOMElement();
});

test('should render i18n message of ctp.logout.notYourCards if there are multiple cards available', async () => {
    const user = userEvent.setup();

    const contextProps = mock<IClickToPayContext>();
    contextProps.ctpState = CtpState.Ready;
    contextProps.cards = [mock<ShopperCard>(), mock<ShopperCard>(), mock<ShopperCard>()];
    contextProps.logoutShopper.mockImplementation();

    customRender(<CtPLogoutLink />, contextProps);
    expect(await screen.findByRole('button', { name: 'Not your cards?' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Not your cards?' }));
    expect(contextProps.logoutShopper).toHaveBeenCalledTimes(1);
});

test('should render i18n message of ctp.logout.notYourCard if there is only one card available', async () => {
    const user = userEvent.setup();

    const contextProps = mock<IClickToPayContext>();
    contextProps.ctpState = CtpState.Ready;
    contextProps.cards = [mock<ShopperCard>()];
    contextProps.logoutShopper.mockImplementation();

    customRender(<CtPLogoutLink />, contextProps);
    expect(await screen.findByRole('button', { name: 'Not your card?' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Not your card?' }));
    expect(contextProps.logoutShopper).toHaveBeenCalledTimes(1);
});

test('should render i18n message of ctp.logout.notYourProfile if there is no card available', async () => {
    const user = userEvent.setup();

    const contextProps = mock<IClickToPayContext>();
    contextProps.ctpState = CtpState.Ready;
    contextProps.cards = [];
    contextProps.logoutShopper.mockImplementation();

    customRender(<CtPLogoutLink />, contextProps);
    expect(await screen.findByRole('button', { name: 'Not your profile?' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Not your profile?' }));
    expect(contextProps.logoutShopper).toHaveBeenCalledTimes(1);
});

test('should render i18n message of ctp.logout.notYou if the shopper is going through OTP ', async () => {
    const user = userEvent.setup();

    const contextProps = mock<IClickToPayContext>();
    contextProps.ctpState = CtpState.OneTimePassword;
    contextProps.logoutShopper.mockImplementation();

    customRender(<CtPLogoutLink />, contextProps);
    expect(await screen.findByRole('button', { name: 'Not you?' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Not you?' }));
    expect(contextProps.logoutShopper).toHaveBeenCalledTimes(1);
});
