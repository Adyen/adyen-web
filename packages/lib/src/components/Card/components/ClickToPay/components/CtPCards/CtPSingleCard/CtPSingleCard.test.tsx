import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import CtPSingleCard from './CtPSingleCard';
import ShopperCard from '../../../models/ShopperCard';

function createShopperCard({ panExpirationYear = '2030', panExpirationMonth = '09' }): ShopperCard {
    return new ShopperCard(
        {
            srcDigitalCardId: 'xxxx-yyyy',
            panLastFour: '2024',
            dateOfCardLastUsed: '2022-09-16T08:10:02.312Z',
            paymentCardDescriptor: 'visa',
            panExpirationMonth: panExpirationMonth,
            panExpirationYear: panExpirationYear,
            digitalCardData: {
                descriptorName: 'Visa',
                artUri: 'http://image.com',
                status: 'ACTIVE'
            },
            tokenId: 'xxxx-wwww'
        },
        'visa',
        '1234566'
    );
}

test('should display Available card', () => {
    render(<CtPSingleCard card={createShopperCard({})} />);
    expect(screen.getByText('Visa •••• 2024')).toBeTruthy();
    expect(screen.queryByText('Expired')).toBeNull();
});

test('should display Expired card label', () => {
    render(<CtPSingleCard card={createShopperCard({ panExpirationYear: '2022', panExpirationMonth: '09' })} />);
    expect(screen.getByText('Visa •••• 2024')).toBeTruthy();
    expect(screen.getByText('Expired')).toBeTruthy();
});
