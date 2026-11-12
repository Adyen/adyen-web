import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { CoreProvider } from '../../../../../../core/Context/CoreProvider';
import { setupCoreMock } from '../../../../../../../config/testMocks/setup-core-mock';
import useClickToPayContext from '../../../context/useClickToPayContext';
import { CtPInfoModal } from './CtPInfoModal';

jest.mock('../../../context/useClickToPayContext', () => ({ __esModule: true, default: jest.fn() }));

const renderModal = (onClose = jest.fn()) => {
    const core = setupCoreMock();
    const renderWithCore = (isOpen: boolean) => (
        <CoreProvider i18n={core.modules.i18n} loadingContext="test" resources={core.modules.resources}>
            <CtPInfoModal isOpen={isOpen} onClose={onClose} focusAfterClose={null} />
        </CoreProvider>
    );

    // The Modal needs its element mounted before it opens, as it does when a shopper opens it
    const { rerender } = render(renderWithCore(false));
    rerender(renderWithCore(true));
};

describe('CtPInfoModal', () => {
    beforeEach(() => {
        (useClickToPayContext as jest.Mock).mockReturnValue({ schemes: [] });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should render the title, description and benefits', () => {
        renderModal();

        expect(screen.getByRole('dialog', { name: 'Click to Pay brings the ease of contactless, online' })).toBeInTheDocument();
        expect(screen.getByText('A fast, secure payment method supported by Mastercard, Visa and other payment cards.')).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(3);
    });

    test('should show the Mastercard and Visa logos when no Click to Pay schemes are known', () => {
        renderModal();

        expect(screen.getByRole('img', { name: 'Logo of Click to Pay' })).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'Logo of Mastercard' })).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'Logo of Visa' })).toBeInTheDocument();
    });

    test('should show only the schemes of the Click to Pay context', () => {
        (useClickToPayContext as jest.Mock).mockReturnValue({ schemes: ['visa'] });
        renderModal();

        expect(screen.getByRole('img', { name: 'Logo of Visa' })).toBeInTheDocument();
        expect(screen.queryByRole('img', { name: 'Logo of Mastercard' })).not.toBeInTheDocument();
    });

    test('should call onClose when the Close button is pressed', async () => {
        const user = userEvent.setup();
        const onClose = jest.fn();
        renderModal(onClose);

        await user.click(screen.getByRole('button', { name: 'Close' }));

        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
