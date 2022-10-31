import { ComponentChildren, h } from 'preact';
import { mock } from 'jest-mock-extended';
import { render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { ClickToPayContext, IClickToPayContext } from '../../context/ClickToPayContext';
import CtPCards from './CtPCards';
import ShopperCard from '../../models/ShopperCard';
import { MastercardCheckout, VisaCheckout } from '../../services/types';

const customRender = (children: ComponentChildren, providerProps: IClickToPayContext) => {
    return render(
        <ClickToPayContext.Provider value={{ ...providerProps }} children={children}>
            {children}
        </ClickToPayContext.Provider>
    );
};

test('should pre selected available card', async () => {
    const user = userEvent.setup();
    const contextProps = mock<IClickToPayContext>();
    contextProps.onSetStatus.mockReturnValue();
    contextProps.amount = { value: 2000, currency: 'EUR' };

    contextProps.cards = [
        new ShopperCard(
            {
                srcDigitalCardId: '654321',
                panLastFour: '8902',
                dateOfCardLastUsed: '2020-05-28T08:10:02.312Z',
                paymentCardDescriptor: 'visa',
                panExpirationMonth: '08',
                panExpirationYear: '2020',
                digitalCardData: {
                    descriptorName: 'Visa',
                    artUri: 'http://image.com/visa'
                },
                tokenId: 'xxxx-wwww'
            },
            'visa',
            '1234566'
        ),
        new ShopperCard(
            {
                srcDigitalCardId: '123456',
                panLastFour: '3456',
                dateOfCardLastUsed: '2022-02-16T08:10:02.312Z',
                paymentCardDescriptor: 'mc',
                panExpirationMonth: '12',
                panExpirationYear: '2025',
                digitalCardData: {
                    descriptorName: 'Mastercard',
                    artUri: 'http://image.com/mc'
                },
                tokenId: 'xxxx-wwww'
            },
            'mc',
            '1234566'
        )
    ];

    customRender(<CtPCards onShowCardButtonClick={jest.fn()} />, contextProps);

    expect(screen.getByRole('button', { name: 'Pay €20.00 with •••• 3456' })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Mastercard •••• 3456/i }).textContent).toBe('Mastercard •••• 3456 ');

    await user.click(screen.getByRole('button', { name: /Mastercard •••• 3456/i }));
    const options = screen.getAllByRole('option');

    expect(options[0].textContent).toBe('Visa •••• 8902 Expired');
    expect(options[0]).toHaveAttribute('aria-selected', 'false');
    expect(options[0]).toHaveAttribute('aria-disabled', 'true');
    expect(options[1].textContent).toBe('Mastercard •••• 3456 ');
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
    expect(options[1]).toHaveAttribute('aria-disabled', 'false');
});

test('should not be able to checkout with expired card (single card)', async () => {
    const user = userEvent.setup();
    const contextProps = mock<IClickToPayContext>();
    contextProps.onSetStatus.mockReturnValue();
    contextProps.amount = { value: 2000, currency: 'EUR' };

    contextProps.cards = [
        new ShopperCard(
            {
                srcDigitalCardId: 'xxxx-yyyy',
                panLastFour: '2024',
                dateOfCardLastUsed: '2022-09-16T08:10:02.312Z',
                paymentCardDescriptor: 'visa',
                panExpirationMonth: '12',
                panExpirationYear: '2019',
                digitalCardData: {
                    descriptorName: 'Visa',
                    artUri: 'http://image.com'
                },
                tokenId: 'xxxx-wwww'
            },
            'visa',
            '1234566'
        )
    ];

    customRender(<CtPCards onShowCardButtonClick={jest.fn()} />, contextProps);

    await user.click(screen.getByRole('button', { name: 'Pay €20.00 with •••• 2024' }));

    expect(contextProps.onSetStatus).toHaveBeenCalledTimes(0);
    expect(screen.getByRole('button', { name: 'Pay €20.00 with •••• 2024' })).toBeDisabled();
});

test('should not be able to checkout with expired card (card list)', async () => {
    const user = userEvent.setup();
    const contextProps = mock<IClickToPayContext>();
    contextProps.onSetStatus.mockReturnValue();
    contextProps.amount = { value: 2000, currency: 'EUR' };

    contextProps.cards = [
        new ShopperCard(
            {
                srcDigitalCardId: '654321',
                panLastFour: '8902',
                dateOfCardLastUsed: '2020-05-28T08:10:02.312Z',
                paymentCardDescriptor: 'visa',
                panExpirationMonth: '08',
                panExpirationYear: '2020',
                digitalCardData: {
                    descriptorName: 'Visa',
                    artUri: 'http://image.com/visa'
                },
                tokenId: 'xxxx-wwww'
            },
            'visa',
            '1234566'
        ),
        new ShopperCard(
            {
                srcDigitalCardId: '123456',
                panLastFour: '3456',
                dateOfCardLastUsed: '2021-02-16T08:10:02.312Z',
                paymentCardDescriptor: 'mc',
                panExpirationMonth: '05',
                panExpirationYear: '2021',
                digitalCardData: {
                    descriptorName: 'Mastercard',
                    artUri: 'http://image.com/mc'
                },
                tokenId: 'xxxx-wwww'
            },
            'mc',
            '1234566'
        )
    ];

    customRender(<CtPCards onShowCardButtonClick={jest.fn()} />, contextProps);

    expect(screen.getByRole('button', { name: 'Pay €20.00 with •••• 8902' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Visa •••• 8902/i }).textContent).toBe('Visa •••• 8902 Expired');

    await user.click(screen.getByRole('button', { name: /Visa •••• 8902/i }));
    const options = screen.getAllByRole('option');

    expect(options[0].textContent).toBe('Visa •••• 8902 Expired');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    expect(options[0]).toHaveAttribute('aria-disabled', 'true');
    expect(options[1].textContent).toBe('Mastercard •••• 3456 Expired');
    expect(options[1]).toHaveAttribute('aria-selected', 'false');
    expect(options[1]).toHaveAttribute('aria-disabled', 'true');

    await user.click(screen.getByRole('button', { name: 'Pay €20.00 with •••• 8902' }));
    expect(contextProps.onSetStatus).toHaveBeenCalledTimes(0);
});

test('should be able to checkout (card list)', async () => {
    const user = userEvent.setup();
    const contextProps = mock<IClickToPayContext>();
    const mcPayload = mock<MastercardCheckout>();

    contextProps.onSetStatus.mockReturnValue();
    contextProps.checkout.mockResolvedValue(mcPayload);
    contextProps.onSubmit.mockImplementation();
    contextProps.amount = { value: 2000, currency: 'EUR' };
    contextProps.cards = [
        new ShopperCard(
            {
                srcDigitalCardId: '654321',
                panLastFour: '8902',
                dateOfCardLastUsed: '2022-09-28T08:10:02.312Z',
                paymentCardDescriptor: 'visa',
                panExpirationMonth: '12',
                panExpirationYear: '2025',
                digitalCardData: {
                    descriptorName: 'Visa',
                    artUri: 'http://image.com/visa'
                },
                tokenId: 'xxxx-wwww'
            },
            'visa',
            '1234566'
        ),
        new ShopperCard(
            {
                srcDigitalCardId: '123456',
                panLastFour: '3456',
                dateOfCardLastUsed: '2022-09-16T08:10:02.312Z',
                paymentCardDescriptor: 'mc',
                panExpirationMonth: '08',
                panExpirationYear: '2025',
                digitalCardData: {
                    descriptorName: 'Mastercard',
                    artUri: 'http://image.com/mc'
                },
                tokenId: 'xxxx-wwww'
            },
            'mc',
            '1234566'
        )
    ];

    customRender(<CtPCards onShowCardButtonClick={jest.fn()} />, contextProps);

    expect(screen.getByRole('button', { name: 'Pay €20.00 with •••• 8902' })).toBeTruthy();

    // Shows available cards by clicking in the Select
    await user.click(screen.getByRole('button', { name: /Visa •••• 8902/i }));
    expect(screen.getAllByRole('option').length).toBe(2);

    // Selects Mastercard, then pay button label gets updated
    await user.selectOptions(screen.getByRole('listbox'), screen.getByRole('option', { name: /Mastercard •••• 3456/i }));
    waitFor(() => expect(screen.getByRole('button', { name: 'Pay €20.00 with •••• 3456' })).toBeTruthy());

    // Shopper checkout with Mastercard card
    await user.click(screen.getByRole('button', { name: 'Pay €20.00 with •••• 3456' }));
    expect(contextProps.checkout).toHaveBeenCalledWith(contextProps.cards[1]);
});

test('should be able to checkout (single card)', async () => {
    const user = userEvent.setup();
    const contextProps = mock<IClickToPayContext>();
    const visaPayload = mock<VisaCheckout>();

    contextProps.onSetStatus.mockReturnValue();
    contextProps.checkout.mockResolvedValue(visaPayload);
    contextProps.onSubmit.mockImplementation();
    contextProps.amount = { value: 2000, currency: 'EUR' };
    contextProps.cards = [
        new ShopperCard(
            {
                srcDigitalCardId: 'xxxx-yyyy',
                panLastFour: '2024',
                dateOfCardLastUsed: '2022-09-16T08:10:02.312Z',
                paymentCardDescriptor: 'visa',
                panExpirationMonth: '12',
                panExpirationYear: '2025',
                digitalCardData: {
                    descriptorName: 'Visa',
                    artUri: 'http://image.com'
                },
                tokenId: 'xxxx-wwww'
            },
            'visa',
            '1234566'
        )
    ];

    customRender(<CtPCards onShowCardButtonClick={jest.fn()} />, contextProps);

    expect(screen.getByText('Visa •••• 2024')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Pay €20.00 with •••• 2024' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Pay €20.00 with •••• 2024' }));

    expect(contextProps.onSetStatus).toHaveBeenCalledWith('loading');
    expect(contextProps.checkout).toHaveBeenCalledWith(contextProps.cards[0]);

    await waitFor(() => expect(contextProps.onSubmit).toHaveBeenCalledWith(visaPayload));
});

test('should display empty card list UI if there is no card available', () => {
    render(<CtPCards onShowCardButtonClick={jest.fn()} />);
});
