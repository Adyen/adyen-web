import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import useAutoFocus from './useAutoFocus';

describe('useAutoFocus', () => {
    test('should focus the attached element once on mount', () => {
        const AttachedComponent = () => {
            const ref = useAutoFocus();
            return (
                <button
                    type="button"
                    ref={element => {
                        ref.current = element;
                    }}
                >
                    Focus me
                </button>
            );
        };

        render(<AttachedComponent />);

        expect(screen.getByRole('button', { name: 'Focus me' })).toHaveFocus();
    });

    test('should not throw when the ref is not attached', () => {
        const DetachedComponent = () => {
            useAutoFocus();
            return <button type="button">Not focused</button>;
        };

        expect(() => render(<DetachedComponent />)).not.toThrow();
        expect(screen.getByRole('button', { name: 'Not focused' })).not.toHaveFocus();
    });
});
