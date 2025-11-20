import { h } from 'preact';
import { fireEvent, render, screen } from '@testing-library/preact';
import Img from './Img';
import { ImgProps } from './types';

describe('Image', () => {
    const renderImg = (props: ImgProps) => render(<Img {...props} />);
    const alt = 'test image';

    test('renders a component', () => {
        renderImg({ alt });
        const image = screen.getByRole('img', { name: alt });
        expect(image).toBeInTheDocument();
        expect(image).toHaveClass('adyen-checkout__image');
    });

    test('has passed className', () => {
        renderImg({ alt, className: 'abc123' });
        expect(screen.getByRole('img', { name: alt })).toHaveClass('abc123');
    });

    test('calls onError callback', () => {
        const onErrorMock = jest.fn();
        renderImg({ alt, src: 'invalid.jpg', onError: onErrorMock });

        const image = screen.getByRole('img', { name: alt });
        fireEvent.error(image);

        expect(onErrorMock).toHaveBeenCalledTimes(1);
    });
});
