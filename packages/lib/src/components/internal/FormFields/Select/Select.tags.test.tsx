import { h } from 'preact';
import { useState } from 'preact/hooks';
import { render, screen, waitFor, within } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import Select from './Select';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import { setupCoreMock } from '../../../../../config/testMocks/setup-core-mock';
import type { SelectItem, SelectProps, SelectTargetObject } from './types';

const core = setupCoreMock();

const SELECT_NAME = 'taggedSelect';

interface TagContract {
    label: string;
    variant: 'success' | 'info';
}

interface TaggedSelectItem extends SelectItem {
    tags?: TagContract[];
}

const SUCCESS_TAG: TagContract = { label: 'Verified', variant: 'success' };
const INFO_TAG: TagContract = { label: 'New', variant: 'info' };
const EXTRA_TAG: TagContract = { label: 'Popular', variant: 'info' };

const PLAIN_ITEM: TaggedSelectItem = { id: 'plain', name: 'Plain option' };
const EMPTY_TAGS_ITEM: TaggedSelectItem = { id: 'empty-tags', name: 'Empty tags option', tags: [] };
const ONE_TAG_ITEM: TaggedSelectItem = {
    id: 'one-tag',
    name: 'Single tag option',
    secondaryText: 'Supporting text one',
    tags: [SUCCESS_TAG]
};
const TWO_TAGS_ITEM: TaggedSelectItem = {
    id: 'two-tags',
    name: 'Two tags option',
    secondaryText: 'Supporting text two',
    tags: [SUCCESS_TAG, INFO_TAG]
};
const THREE_TAGS_ITEM: TaggedSelectItem = {
    id: 'three-tags',
    name: 'Three tags option',
    secondaryText: 'Supporting text three',
    tags: [SUCCESS_TAG, INFO_TAG, EXTRA_TAG]
};
const DISABLED_TAGGED_ITEM: TaggedSelectItem = {
    id: 'disabled-tagged',
    name: 'Disabled option',
    tags: [INFO_TAG],
    disabled: true
};

const ITEMS: TaggedSelectItem[] = [PLAIN_ITEM, EMPTY_TAGS_ITEM, ONE_TAG_ITEM, TWO_TAGS_ITEM, THREE_TAGS_ITEM, DISABLED_TAGGED_ITEM];

const withCore = (children: h.JSX.Element) => (
    <CoreProvider i18n={core.modules.i18n} loadingContext="test" resources={core.modules.resources}>
        {children}
    </CoreProvider>
);

const renderSelect = (props: Partial<SelectProps> & { items: TaggedSelectItem[] }) =>
    render(withCore(<Select className="" classNameModifiers={[]} readonly={false} name={SELECT_NAME} {...props} />));

interface ControlledSelectProps {
    items: TaggedSelectItem[];
}

const ControlledSelect = ({ items }: Readonly<ControlledSelectProps>) => {
    const [selectedValue, setSelectedValue] = useState<string | number | undefined>('');

    return (
        <Select
            className=""
            classNameModifiers={[]}
            readonly={false}
            filterable={false}
            items={items}
            name={SELECT_NAME}
            selectedValue={selectedValue}
            onChange={e => setSelectedValue((e.target as SelectTargetObject).value)}
        />
    );
};

const textOf = (element: HTMLElement) => element.textContent.replace(/\s+/g, ' ').trim();

/**
 * Adjacent elements contribute no whitespace to `textContent`, so the parts are joined with an
 * optional separator. The pattern stays anchored, which still rejects stray, missing or repeated text.
 */
const contentOf = (...parts: string[]) => new RegExp(`^${parts.join('\\s*')}$`);

/**
 * In the filterable variant the `combobox` role sits on the filter input, so the collapsed button
 * (which holds the tags) is its parent element.
 */
const getCollapsedButton = (): HTMLElement => {
    const combobox = screen.getByRole('combobox');
    // eslint-disable-next-line testing-library/no-node-access -- the filter input has no role of its own to scope tag queries to
    return combobox.tagName === 'INPUT' ? combobox.parentElement : combobox;
};

const getOption = (item: TaggedSelectItem) => screen.getByRole('option', { name: new RegExp(item.name) });

describe('Select with tags', () => {
    const user = userEvent.setup();

    describe('expanded list item', () => {
        const openList = async () => {
            await user.click(screen.getByRole('combobox'));
        };

        test('adds no tag node for an option without tags', async () => {
            renderSelect({ items: ITEMS, filterable: false });
            await openList();

            expect(textOf(getOption(PLAIN_ITEM))).toBe('Plain option');
        });

        test('adds no tag node for an empty tags array', async () => {
            renderSelect({ items: ITEMS, filterable: false });
            await openList();

            expect(textOf(getOption(EMPTY_TAGS_ITEM))).toBe('Empty tags option');
        });

        test('renders a single tag after the secondaryText', async () => {
            renderSelect({ items: ITEMS, filterable: false });
            await openList();

            expect(textOf(getOption(ONE_TAG_ITEM))).toMatch(contentOf('Single tag option', 'Supporting text one', 'Verified'));
        });

        test('renders two tags in array order', async () => {
            renderSelect({ items: ITEMS, filterable: false });
            await openList();

            expect(textOf(getOption(TWO_TAGS_ITEM))).toMatch(contentOf('Two tags option', 'Supporting text two', 'Verified', 'New'));
        });

        test('renders three tags in array order, without dropping any', async () => {
            renderSelect({ items: ITEMS, filterable: false });
            await openList();

            expect(textOf(getOption(THREE_TAGS_ITEM))).toMatch(contentOf('Three tags option', 'Supporting text three', 'Verified', 'New', 'Popular'));
        });

        test('exposes name, secondaryText and tags to screen readers in that order', async () => {
            renderSelect({ items: ITEMS, filterable: false });
            await openList();

            expect(getOption(TWO_TAGS_ITEM)).toHaveAccessibleName('Two tags option Supporting text two Verified New');
        });
    });

    describe('collapsed select button', () => {
        test('shows the name and the single tag of the selected option, without the secondaryText', () => {
            renderSelect({ items: ITEMS, filterable: false, selectedValue: ONE_TAG_ITEM.id });

            expect(textOf(getCollapsedButton())).toMatch(contentOf('Single tag option', 'Verified'));
        });

        test('shows both tags of the selected option, without the secondaryText', () => {
            renderSelect({ items: ITEMS, filterable: false, selectedValue: TWO_TAGS_ITEM.id });

            expect(textOf(getCollapsedButton())).toMatch(contentOf('Two tags option', 'Verified', 'New'));
        });

        test('shows all three tags of the selected option, without the secondaryText', () => {
            renderSelect({ items: ITEMS, filterable: false, selectedValue: THREE_TAGS_ITEM.id });

            expect(textOf(getCollapsedButton())).toMatch(contentOf('Three tags option', 'Verified', 'New', 'Popular'));
        });

        test('includes the tag labels in the accessible name when uniqueId is set', () => {
            renderSelect({ items: ITEMS, filterable: false, selectedValue: TWO_TAGS_ITEM.id, uniqueId: 'tagged-select' });

            expect(screen.getByRole('combobox')).toHaveAccessibleName(/Two tags option[\s\S]*Verified[\s\S]*New/);
        });

        test('shows the tags of the selected option in the filterable variant', () => {
            renderSelect({ items: ITEMS, filterable: true, selectedValue: TWO_TAGS_ITEM.id });

            const button = getCollapsedButton();

            expect(screen.getByRole('combobox')).toHaveValue(TWO_TAGS_ITEM.name);
            expect(within(button).getByText(SUCCESS_TAG.label)).toBeInTheDocument();
            expect(within(button).getByText(INFO_TAG.label)).toBeInTheDocument();
            expect(textOf(button)).not.toContain(TWO_TAGS_ITEM.secondaryText);
        });

        test('hides the tags of the filterable variant while the list is open', async () => {
            renderSelect({ items: ITEMS, filterable: true, selectedValue: TWO_TAGS_ITEM.id });

            await user.click(screen.getByRole('combobox'));

            const button = getCollapsedButton();

            expect(within(button).queryByText(SUCCESS_TAG.label)).not.toBeInTheDocument();
            expect(within(button).queryByText(INFO_TAG.label)).not.toBeInTheDocument();
        });
    });

    describe('selection', () => {
        test('updates the collapsed button with the name and tags of the newly selected option', async () => {
            render(withCore(<ControlledSelect items={ITEMS} />));

            await user.click(screen.getByRole('combobox'));
            await user.click(getOption(TWO_TAGS_ITEM));

            await waitFor(() => expect(textOf(getCollapsedButton())).toMatch(contentOf('Two tags option', 'Verified', 'New')));
        });
    });

    describe('disabled tagged option', () => {
        test('is announced as disabled and still exposes its tag label', async () => {
            renderSelect({ items: ITEMS, filterable: false });

            await user.click(screen.getByRole('combobox'));

            const option = getOption(DISABLED_TAGGED_ITEM);

            expect(option).toHaveAttribute('aria-disabled', 'true');
            expect(textOf(option)).toMatch(contentOf('Disabled option', 'New'));
        });
    });

    describe('filtering', () => {
        test('does not match on tag labels', async () => {
            renderSelect({ items: ITEMS, filterable: true });

            await user.type(screen.getByRole('combobox'), SUCCESS_TAG.label);

            expect(screen.queryAllByRole('option')).toHaveLength(0);
            await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('No options found'));
        });
    });

    describe('translations', () => {
        test('renders a tag label that looks like a translation key verbatim, in the option and in the button', async () => {
            const items: TaggedSelectItem[] = [
                { id: 'raw-label', name: 'Raw label option', tags: [{ label: 'select.tag.example', variant: 'info' }] }
            ];

            renderSelect({ items, filterable: false, selectedValue: 'raw-label' });

            expect(within(getCollapsedButton()).getByText('select.tag.example')).toBeInTheDocument();

            await user.click(screen.getByRole('combobox'));

            expect(within(screen.getAllByRole('option')[0]).getByText('select.tag.example')).toBeInTheDocument();
        });
    });
});
