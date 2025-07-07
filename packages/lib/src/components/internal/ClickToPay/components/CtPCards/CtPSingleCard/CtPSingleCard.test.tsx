import { ComponentChildren, h } from 'preact';
import { render, screen } from '@testing-library/preact';
import CtPSingleCard from './CtPSingleCard';
import ShopperCard from '../../../models/ShopperCard';
import { CoreProvider } from '../../../../../../core/Context/CoreProvider';
import { DigitalCardStatus } from '../../../services/sdks/types';

function createShopperCard({ panExpirationYear = '2030', panExpirationMonth = '09', status = 'ACTIVE' as DigitalCardStatus }): ShopperCard {
    return new ShopperCard(
        {
            srcDigitalCardId: 'xxxx-yyyy',
            panLastFour: '2024',
            dateOfCardCreated: '2015-10-10T09:15:00.312Z',
            dateOfCardLastUsed: '2022-09-16T08:10:02.312Z',
            paymentCardDescriptor: 'visa',
            panExpirationMonth: panExpirationMonth,
            panExpirationYear: panExpirationYear,
            digitalCardData: {
                descriptorName: 'Visa',
                artUri: 'http://image.com',
                status
            },
            tokenId: 'xxxx-wwww'
        },
        'visa',
        '1234566'
    );
}

const customRender = (children: ComponentChildren) => {
    return render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            {children}
        </CoreProvider>
    );
};

test('should display Available card', () => {
    customRender(<CtPSingleCard card={createShopperCard({})} />);
    expect(screen.getByText('Visa •••• 2024')).toBeTruthy();
    expect(screen.queryByText('Expired')).toBeNull();
});

test('should display Expired card label', () => {
    customRender(<CtPSingleCard card={createShopperCard({ panExpirationYear: '2022', panExpirationMonth: '09' })} />);
    expect(screen.getByText('Visa •••• 2024')).toBeTruthy();
    expect(screen.getByText('Expired')).toBeTruthy();
});

test('should display Expired card label for SUSPENDED card', () => {
    customRender(<CtPSingleCard card={createShopperCard({ status: 'SUSPENDED' })} />);
    expect(screen.getByText('Visa •••• 2024')).toBeTruthy();
    expect(screen.getByText('Expired')).toBeTruthy();
});

test('should display Expired card label for EXPIRED card', () => {
    customRender(<CtPSingleCard card={createShopperCard({ status: 'EXPIRED' })} />);
    expect(screen.getByText('Visa •••• 2024')).toBeTruthy();
    expect(screen.getByText('Expired')).toBeTruthy();
});

test('should not display Expired card label for PENDING card', () => {
    customRender(<CtPSingleCard card={createShopperCard({ status: 'PENDING' })} />);
    expect(screen.getByText('Visa •••• 2024')).toBeTruthy();
    expect(screen.queryByText('Expired')).not.toBeInTheDocument();
});
