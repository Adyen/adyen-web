import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import { Tag } from './Tag';
import { TagVariant } from './types';

const VARIANTS: TagVariant[] = Object.values(TagVariant);

describe('Tag', () => {
    test.each(VARIANTS)('renders the label text for the %s variant', variant => {
        render(<Tag label="Verified" variant={variant} />);

        expect(screen.getByText('Verified')).toBeInTheDocument();
    });

    test.each(VARIANTS)('is presentational for the %s variant: no role, not focusable, and no aria overrides', variant => {
        const { container } = render(<Tag label="Verified" variant={variant} />);

        const tag = screen.getByText('Verified');

        expect(container).toHaveTextContent('Verified');
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
        expect(tag).not.toHaveAttribute('role');
        expect(tag).not.toHaveAttribute('tabindex');
        expect(tag).not.toHaveAttribute('aria-hidden');
        expect(tag).not.toHaveAttribute('aria-label');
        expect(tag).not.toHaveAttribute('aria-labelledby');
    });

    test('renders every variant as the same element type, so the variant carries no semantics', () => {
        render(
            <div>
                <Tag label="Verified" variant={TagVariant.SUCCESS} />
                <Tag label="New" variant={TagVariant.INFO} />
            </div>
        );

        expect(screen.getByText('Verified').tagName).toBe(screen.getByText('New').tagName);
    });
});
