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

type SecondaryContent = 'tag' | 'secondaryText';

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

type RenderSelectProps = Partial<SelectProps> & { items: TaggedSelectItem[]; secondaryContent?: SecondaryContent };

const renderSelect = (props: RenderSelectProps) =>
    render(withCore(<Select className="" classNameModifiers={[]} readonly={false} name={SELECT_NAME} {...props} />));

const renderTaggedSelect = (props: RenderSelectProps) => renderSelect({ secondaryContent: 'tag', ...props });

interface ControlledSelectProps {
    items: TaggedSelectItem[];
}

const ControlledSelect = ({ items }: Readonly<ControlledSelectProps>) => {
    const [selectedValue, setSelectedValue] = useState<string | number | undefined>('');

    const props: RenderSelectProps = {
        items,
        filterable: false,
        secondaryContent: 'tag',
        selectedValue,
        onChange: e => setSelectedValue((e.target as SelectTargetObject).value)
    };

    return <Select className="" classNameModifiers={[]} readonly={false} name={SELECT_NAME} {...props} />;
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
            renderTaggedSelect({ items: ITEMS, filterable: false });
            await openList();

            expect(textOf(getOption(PLAIN_ITEM))).toBe('Plain option');
        });

        test('adds no tag node for an empty tags array', async () => {
            renderTaggedSelect({ items: ITEMS, filterable: false });
            await openList();

            expect(textOf(getOption(EMPTY_TAGS_ITEM))).toBe('Empty tags option');
        });

        test('renders a single tag in place of the secondaryText', async () => {
            renderTaggedSelect({ items: ITEMS, filterable: false });
            await openList();

            expect(textOf(getOption(ONE_TAG_ITEM))).toMatch(contentOf('Single tag option', 'Verified'));
        });

        test('renders two tags in array order', async () => {
            renderTaggedSelect({ items: ITEMS, filterable: false });
            await openList();

            expect(textOf(getOption(TWO_TAGS_ITEM))).toMatch(contentOf('Two tags option', 'Verified', 'New'));
        });

        test('renders three tags in array order, without dropping any', async () => {
            renderTaggedSelect({ items: ITEMS, filterable: false });
            await openList();

            expect(textOf(getOption(THREE_TAGS_ITEM))).toMatch(contentOf('Three tags option', 'Verified', 'New', 'Popular'));
        });

        test('exposes the name and the tags to screen readers in that order, omitting the secondaryText', async () => {
            renderTaggedSelect({ items: ITEMS, filterable: false });
            await openList();

            expect(getOption(TWO_TAGS_ITEM)).toHaveAccessibleName('Two tags option Verified New');
        });
    });

    describe('collapsed select button', () => {
        test('shows the name and the single tag of the selected option', () => {
            renderTaggedSelect({ items: ITEMS, filterable: false, selectedValue: ONE_TAG_ITEM.id });

            expect(textOf(getCollapsedButton())).toMatch(contentOf('Single tag option', 'Verified'));
        });

        test('shows both tags of the selected option', () => {
            renderTaggedSelect({ items: ITEMS, filterable: false, selectedValue: TWO_TAGS_ITEM.id });

            expect(textOf(getCollapsedButton())).toMatch(contentOf('Two tags option', 'Verified', 'New'));
        });

        test('shows all three tags of the selected option', () => {
            renderTaggedSelect({ items: ITEMS, filterable: false, selectedValue: THREE_TAGS_ITEM.id });

            expect(textOf(getCollapsedButton())).toMatch(contentOf('Three tags option', 'Verified', 'New', 'Popular'));
        });

        test('includes the tag labels in the accessible name when uniqueId is set', () => {
            renderTaggedSelect({ items: ITEMS, filterable: false, selectedValue: TWO_TAGS_ITEM.id, uniqueId: 'tagged-select' });

            expect(screen.getByRole('combobox')).toHaveAccessibleName(/Two tags option[\s\S]*Verified[\s\S]*New/);
        });

        test('shows the tags of the selected option in the filterable variant', () => {
            renderTaggedSelect({ items: ITEMS, filterable: true, selectedValue: TWO_TAGS_ITEM.id });

            const button = getCollapsedButton();

            expect(screen.getByRole('combobox')).toHaveValue(TWO_TAGS_ITEM.name);
            expect(within(button).getByText(SUCCESS_TAG.label)).toBeInTheDocument();
            expect(within(button).getByText(INFO_TAG.label)).toBeInTheDocument();
            expect(textOf(button)).not.toContain(TWO_TAGS_ITEM.secondaryText);
        });

        test('hides the tags of the filterable variant while the list is open', async () => {
            renderTaggedSelect({ items: ITEMS, filterable: true, selectedValue: TWO_TAGS_ITEM.id });

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
            renderTaggedSelect({ items: ITEMS, filterable: false });

            await user.click(screen.getByRole('combobox'));

            const option = getOption(DISABLED_TAGGED_ITEM);

            expect(option).toHaveAttribute('aria-disabled', 'true');
            expect(textOf(option)).toMatch(contentOf('Disabled option', 'New'));
        });
    });

    describe('filtering', () => {
        test('does not match on tag labels', async () => {
            renderTaggedSelect({ items: ITEMS, filterable: true });

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

            renderTaggedSelect({ items, filterable: false, selectedValue: 'raw-label' });

            expect(within(getCollapsedButton()).getByText('select.tag.example')).toBeInTheDocument();

            await user.click(screen.getByRole('combobox'));

            expect(within(screen.getAllByRole('option')[0]).getByText('select.tag.example')).toBeInTheDocument();
        });
    });

    describe('secondaryContent mode', () => {
        const openList = async () => {
            await user.click(screen.getByRole('combobox'));
        };

        test('defaults to secondaryText, leaving the tags of an option unrendered', async () => {
            renderSelect({ items: ITEMS, filterable: false });
            await openList();

            expect(textOf(getOption(ONE_TAG_ITEM))).toMatch(contentOf('Single tag option', 'Supporting text one'));
            expect(screen.queryByText(SUCCESS_TAG.label)).not.toBeInTheDocument();
        });

        test("treats an explicit 'secondaryText' the same as the default", async () => {
            renderSelect({ items: ITEMS, filterable: false, secondaryContent: 'secondaryText' });
            await openList();

            expect(textOf(getOption(TWO_TAGS_ITEM))).toMatch(contentOf('Two tags option', 'Supporting text two'));
            expect(screen.queryByText(SUCCESS_TAG.label)).not.toBeInTheDocument();
            expect(screen.queryByText(INFO_TAG.label)).not.toBeInTheDocument();
        });

        test("renders the tags of an option only once 'tag' is passed", async () => {
            renderSelect({ items: ITEMS, filterable: false, secondaryContent: 'tag' });
            await openList();

            expect(within(getOption(TWO_TAGS_ITEM)).getByText(SUCCESS_TAG.label)).toBeInTheDocument();
            expect(within(getOption(TWO_TAGS_ITEM)).getByText(INFO_TAG.label)).toBeInTheDocument();
        });

        test('keeps the secondaryText in the collapsed button under the default', () => {
            renderSelect({ items: ITEMS, filterable: false, selectedValue: TWO_TAGS_ITEM.id });

            expect(textOf(getCollapsedButton())).toMatch(contentOf('Two tags option', 'Supporting text two'));
        });

        test("swaps the collapsed button over to the tags under 'tag'", () => {
            renderSelect({ items: ITEMS, filterable: false, selectedValue: TWO_TAGS_ITEM.id, secondaryContent: 'tag' });

            expect(textOf(getCollapsedButton())).toMatch(contentOf('Two tags option', 'Verified', 'New'));
        });

        test("ignores the secondaryText of a tagless option under 'tag', rather than rendering it as a tag", async () => {
            const items: TaggedSelectItem[] = [{ id: 'no-tags', name: 'Tagless option', secondaryText: 'Supporting text' }];

            renderSelect({ items, filterable: false, secondaryContent: 'tag' });
            await openList();

            expect(textOf(getOption(items[0]))).toBe('Tagless option');
        });

        test("ignores the tags of an option under 'secondaryText', rather than rendering both", async () => {
            renderSelect({ items: ITEMS, filterable: false, secondaryContent: 'secondaryText' });
            await openList();

            expect(textOf(getOption(THREE_TAGS_ITEM))).toMatch(contentOf('Three tags option', 'Supporting text three'));
            expect(screen.queryByText(EXTRA_TAG.label)).not.toBeInTheDocument();
        });
    });
});
