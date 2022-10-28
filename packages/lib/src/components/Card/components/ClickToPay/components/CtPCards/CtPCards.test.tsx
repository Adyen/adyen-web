import { ComponentChildren, h } from 'preact';
import { mock } from 'jest-mock-extended';
import { render, screen, fireEvent, waitFor } from '@testing-library/preact';
import { ClickToPayContext, IClickToPayContext } from '../../context/ClickToPayContext';
import CtPCards from './CtPCards';
import ShopperCard from '../../models/ShopperCard';
import { VisaCheckout } from '../../services/types';

const customRender = (children: ComponentChildren, providerProps: IClickToPayContext) => {
    return render(
        <ClickToPayContext.Provider value={{ ...providerProps }} children={children}>
            {children}
        </ClickToPayContext.Provider>
    );
};

test('should checkout with single card', async () => {
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

    fireEvent.click(screen.getByRole('button', { name: 'Pay €20.00 with •••• 2024' }));

    expect(contextProps.onSetStatus).toHaveBeenCalledWith('loading');
    expect(contextProps.checkout).toHaveBeenCalledWith(contextProps.cards[0]);

    await waitFor(() => expect(contextProps.onSubmit).toHaveBeenCalledWith(visaPayload));
});

test('should display empty card list UI if there is no card available', () => {
    render(<CtPCards onShowCardButtonClick={jest.fn()} />);
});
