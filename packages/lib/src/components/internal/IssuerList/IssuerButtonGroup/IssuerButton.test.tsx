import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import IssuerButton from './IssuerButton';

describe('IssuerButton', () => {
    test('should render the button without an image when the icon is null', () => {
        render(<IssuerButton name="Test Bank" id="1" selected={false} onClick={jest.fn()} icon={null} />);

        expect(screen.getByRole('button', { name: 'Test Bank' })).toBeInTheDocument();
        expect(screen.queryByRole('img')).toBeNull();
    });
});
