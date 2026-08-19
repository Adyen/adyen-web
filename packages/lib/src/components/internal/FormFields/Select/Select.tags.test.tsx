import { h } from 'preact';
import { useState } from 'preact/hooks';
import { render, screen, waitFor, within } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import Select from './Select';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import { setupCoreMock } from '../../../../../config/testMocks/setup-core-mock';
import { type SelectItem, type SelectProps, type SelectTargetObject } from './types';
import { TagVariant } from '../../Tag/types';

const core = setupCoreMock();

const SELECT_NAME = 'taggedSelect';

/**
 * Derived from the component contract so the fixtures cannot drift from what `Select` accepts.
 */
type SelectItemTag = NonNullable<SelectItem['tags']>[number];

const SUCCESS_TAG: SelectItemTag = { label: 'Verified', variant: TagVariant.SUCCESS };
const INFO_TAG: SelectItemTag = { label: 'New', variant: TagVariant.INFO };
const EXTRA_TAG: SelectItemTag = { label: 'Popular', variant: TagVariant.INFO };

/**
 * `satisfies` checks the fixtures against `SelectItem` while keeping the concrete property types, so
 * optional fields such as `secondaryText` stay `string` at the call sites instead of `string | undefined`.
 */
const PLAIN_ITEM = { id: 'plain', name: 'Plain option' } satisfies SelectItem;
const EMPTY_TAGS_ITEM = { id: 'empty-tags', name: 'Empty tags option', tags: [] } satisfies SelectItem;
const ONE_TAG_ITEM = {
    id: 'one-tag',
    name: 'Single tag option',
    secondaryText: 'Supporting text one',
    tags: [SUCCESS_TAG]
} satisfies SelectItem;
const TWO_TAGS_ITEM = {
    id: 'two-tags',
    name: 'Two tags option',
    secondaryText: 'Supporting text two',
    tags: [SUCCESS_TAG, INFO_TAG]
} satisfies SelectItem;
const THREE_TAGS_ITEM = {
    id: 'three-tags',
    name: 'Three tags option',
    secondaryText: 'Supporting text three',
    tags: [SUCCESS_TAG, INFO_TAG, EXTRA_TAG]
} satisfies SelectItem;
const DISABLED_TAGGED_ITEM = {
    id: 'disabled-tagged',
    name: 'Disabled option',
    tags: [INFO_TAG],
    disabled: true
} satisfies SelectItem;

/**
 * A name long enough that it cannot share a row with the tags, used to pin down what survives the
 * collapsed button's truncation.
 */
const LONG_NAME_TAGGED_ITEM = {
    id: 'long-name',
    name: 'An extremely long option name that will not fit inside the collapsed dropdown button on any sensible width',
    tags: [SUCCESS_TAG, INFO_TAG]
} satisfies SelectItem;

const ITEMS: SelectItem[] = [PLAIN_ITEM, EMPTY_TAGS_ITEM, ONE_TAG_ITEM, TWO_TAGS_ITEM, THREE_TAGS_ITEM, DISABLED_TAGGED_ITEM];

const withCore = (children: h.JSX.Element) => (
    <CoreProvider i18n={core.modules.i18n} loadingContext="test" resources={core.modules.resources}>
        {children}
    </CoreProvider>
);

type RenderSelectProps = Partial<SelectProps> & { items: SelectItem[] };

const renderSelect = (props: RenderSelectProps) =>
    render(withCore(<Select className="" classNameModifiers={[]} readonly={false} name={SELECT_NAME} {...props} />));

interface ControlledSelectProps {
    items: SelectItem[];
}

const ControlledSelect = ({ items }: Readonly<ControlledSelectProps>) => {
    const [selectedValue, setSelectedValue] = useState<string | number | undefined>('');

    const props: RenderSelectProps = {
        items,
        filterable: false,
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
 * In the non-filterable variant the collapsed button itself carries the `combobox` role, so it can be
 * queried directly. The filterable variant is covered by `countOutsideList`.
 */
const getCollapsedButton = (): HTMLElement => screen.getByRole('combobox');

/**
 * In the filterable variant the `combobox` role sits on the filter input and its wrapper — the element
 * holding the tags — has no role of its own. The list is always in the DOM, so comparing how often a
 * text occurs in total against how often it occurs inside the `listbox` reveals whether the collapsed
 * button renders it, without reaching into the DOM.
 */
const countOutsideList = (text: string): number => {
    const total = screen.queryAllByText(text).length;
    const insideList = within(screen.getByRole('listbox')).queryAllByText(text).length;
    return total - insideList;
};

const getOption = (item: SelectItem) => screen.getByRole('option', { name: new RegExp(item.name) });

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

        test('renders two tags in array order, after the secondaryText', async () => {
            renderSelect({ items: ITEMS, filterable: false });
            await openList();

            expect(textOf(getOption(TWO_TAGS_ITEM))).toMatch(contentOf('Two tags option', 'Supporting text two', 'Verified', 'New'));
        });

        test('renders three tags in array order, without dropping any', async () => {
            renderSelect({ items: ITEMS, filterable: false });
            await openList();

            expect(textOf(getOption(THREE_TAGS_ITEM))).toMatch(contentOf('Three tags option', 'Supporting text three', 'Verified', 'New', 'Popular'));
        });

        test('exposes the name, the secondaryText and the tags to screen readers in that order', async () => {
            renderSelect({ items: ITEMS, filterable: false });
            await openList();

            expect(getOption(TWO_TAGS_ITEM)).toHaveAccessibleName('Two tags option Supporting text two Verified New');
        });
    });

    describe('collapsed select button', () => {
        test('shows the name and the single tag of the selected option', () => {
            renderSelect({ items: ITEMS, filterable: false, selectedValue: ONE_TAG_ITEM.id });

            expect(textOf(getCollapsedButton())).toMatch(contentOf('Single tag option', 'Verified'));
        });

        test('shows both tags of the selected option', () => {
            renderSelect({ items: ITEMS, filterable: false, selectedValue: TWO_TAGS_ITEM.id });

            expect(textOf(getCollapsedButton())).toMatch(contentOf('Two tags option', 'Verified', 'New'));
        });

        test('shows all three tags of the selected option', () => {
            renderSelect({ items: ITEMS, filterable: false, selectedValue: THREE_TAGS_ITEM.id });

            expect(textOf(getCollapsedButton())).toMatch(contentOf('Three tags option', 'Verified', 'New', 'Popular'));
        });

        // With a uniqueId the button is labelled by '[id]-label [id]-value', so the accessible name is
        // scoped to the label and the selected name, leaving the tags out of it.
        test('narrows the accessible name down to the selected name when uniqueId is set', () => {
            renderSelect({ items: ITEMS, filterable: false, selectedValue: TWO_TAGS_ITEM.id, uniqueId: 'tagged-select' });

            expect(screen.getByRole('combobox')).toHaveAccessibleName('Two tags option');
        });

        test('shows the tags of the selected option in the filterable variant', () => {
            renderSelect({ items: ITEMS, filterable: true, selectedValue: TWO_TAGS_ITEM.id });

            expect(screen.getByRole('combobox')).toHaveValue(TWO_TAGS_ITEM.name);
            expect(countOutsideList(SUCCESS_TAG.label)).toBe(1);
            expect(countOutsideList(INFO_TAG.label)).toBe(1);
            expect(countOutsideList(TWO_TAGS_ITEM.secondaryText)).toBe(0);
        });

        test('hides the tags of the filterable variant while the list is open', async () => {
            renderSelect({ items: ITEMS, filterable: true, selectedValue: TWO_TAGS_ITEM.id });

            await user.click(screen.getByRole('combobox'));

            expect(countOutsideList(SUCCESS_TAG.label)).toBe(0);
            expect(countOutsideList(INFO_TAG.label)).toBe(0);
        });

        // The collapsed button is tags-only: supporting text is reserved for the open list, so a
        // consumer that needs it collapsed has to convey the state another way, e.g. `disabled`.
        test('never renders the secondaryText of the selected option', () => {
            renderSelect({ items: ITEMS, filterable: false, selectedValue: TWO_TAGS_ITEM.id });

            expect(within(getCollapsedButton()).queryByText(TWO_TAGS_ITEM.secondaryText)).not.toBeInTheDocument();
        });
    });

    /**
     * Structural only. jsdom has no layout engine, so these cannot assert that the tags visually fit
     * beside a truncated name — they pin down that nothing is dropped from the DOM and that the name
     * keeps the class carrying `text-overflow: ellipsis`, which is what the layout fix builds on.
     */
    describe('truncation', () => {
        test('keeps both tags beside a name too long for the collapsed button', () => {
            renderSelect({ items: [LONG_NAME_TAGGED_ITEM], filterable: false, selectedValue: LONG_NAME_TAGGED_ITEM.id });

            const button = getCollapsedButton();

            expect(within(button).getByText(LONG_NAME_TAGGED_ITEM.name)).toHaveClass('adyen-checkout__dropdown__button__text');
            expect(within(button).getByText(SUCCESS_TAG.label)).toBeInTheDocument();
            expect(within(button).getByText(INFO_TAG.label)).toBeInTheDocument();
        });

        test('keeps both tags beside a long name in the filterable variant', () => {
            renderSelect({ items: [LONG_NAME_TAGGED_ITEM], filterable: true, selectedValue: LONG_NAME_TAGGED_ITEM.id });

            expect(screen.getByRole('combobox')).toHaveValue(LONG_NAME_TAGGED_ITEM.name);
            expect(countOutsideList(SUCCESS_TAG.label)).toBe(1);
            expect(countOutsideList(INFO_TAG.label)).toBe(1);
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
            const items: SelectItem[] = [
                { id: 'raw-label', name: 'Raw label option', tags: [{ label: 'select.tag.example', variant: TagVariant.INFO }] }
            ];

            renderSelect({ items, filterable: false, selectedValue: 'raw-label' });

            expect(within(getCollapsedButton()).getByText('select.tag.example')).toBeInTheDocument();

            await user.click(screen.getByRole('combobox'));

            expect(within(screen.getAllByRole('option')[0]).getByText('select.tag.example')).toBeInTheDocument();
        });
    });
});
