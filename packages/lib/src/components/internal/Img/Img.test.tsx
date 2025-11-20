import { h } from 'preact';
import { fireEvent, render, screen } from '@testing-library/preact';
import Img from './Img';
import { ImgProps } from './types';

describe('Image', () => {
    const renderImg = (props: ImgProps) => render(<Img {...props} />);

    test('renders a component', () => {
        renderImg({ alt: 'test image' });
        const image = screen.getByRole('img', { name: 'test image' });
        expect(image).toBeInTheDocument();
        expect(image).toHaveClass('adyen-checkout__image');
    });

    test('has passed className', () => {
        renderImg({ alt: 'test image', className: 'abc123' });
        expect(screen.getByRole('img')).toHaveClass('abc123');
    });

    test('calls onError callback', () => {
        const onErrorMock = jest.fn();
        renderImg({ alt: 'test image', src: 'invalid.jpg', onError: onErrorMock });

        const image = screen.getByRole('img');
        fireEvent.error(image);

        expect(onErrorMock).toHaveBeenCalledTimes(1);
    });
});
