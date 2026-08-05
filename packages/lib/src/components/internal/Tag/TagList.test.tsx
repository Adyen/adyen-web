import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import { TagList } from './TagList';
import { TagVariant } from './types';

describe('TagList', () => {
    test('renders one tag per entry, in the order they were passed', () => {
        render(
            <TagList
                tags={[
                    { label: 'Verified', variant: TagVariant.SUCCESS },
                    { label: 'New', variant: TagVariant.INFO }
                ]}
            />
        );

        expect(screen.getByText('Verified')).toBeInTheDocument();
        expect(screen.getByText('New')).toBeInTheDocument();
        expect(screen.getByText('Verified').compareDocumentPosition(screen.getByText('New'))).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    test.each([
        ['undefined', undefined],
        ['empty', []]
    ])('renders nothing when tags is %s, so the parent layout is unaffected', (_, tags) => {
        const { container } = render(<TagList tags={tags} />);

        expect(container).toBeEmptyDOMElement();
    });

    test('is presentational: the wrapper adds no list semantics', () => {
        render(<TagList tags={[{ label: 'Verified' }, { label: 'New' }]} />);

        expect(screen.queryByRole('list')).not.toBeInTheDocument();
        expect(screen.queryByRole('group')).not.toBeInTheDocument();
    });
});
