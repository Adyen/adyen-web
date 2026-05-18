import { h } from 'preact';
import { render, screen } from '@testing-library/preact';

const renderIframe = (props = {}) =>
    render(<iframe title="iframe-title" name={'test'} width={'200'} height={'300'} src={'https://www.google.com'} {...props} />);

describe('iframe', () => {
    test('should render an iframe', () => {
        renderIframe();
        expect(screen.getByTitle('iframe-title')).toBeInTheDocument();
    });

    test('should have the right source', () => {
        renderIframe();
        expect(screen.getByTitle('iframe-title')).toHaveAttribute('src', 'https://www.google.com');
    });

    test('should render the allow property', () => {
        renderIframe({ allow: 'test' });
        expect(screen.getByTitle('iframe-title')).toHaveAttribute('allow', 'test');
    });

    test('should have the right width and height properties', () => {
        renderIframe({ allow: 'test' });
        const iframe = screen.getByTitle('iframe-title');
        expect(iframe).toHaveAttribute('height', '300');
        expect(iframe).toHaveAttribute('width', '200');
    });
});
