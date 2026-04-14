import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import uuid from '../../../../utils/uuid';
import { keys } from './constants';
import { SelectItem } from './types';
import { simulateFocusScroll } from '../utils';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { ARIA_CONTEXT_SUFFIX, ARIA_ERROR_SUFFIX } from '../../../../core/Errors/constants';

interface UseSelectBaseProps {
    items: SelectItem[];
    selectedValue?: string | number;
    isInvalid?: boolean;
    uniqueId?: string;
    onListToggle?: (isOpen: boolean) => void;
}

function useSelectBase({ items, selectedValue, isInvalid, uniqueId, onListToggle }: UseSelectBaseProps) {
    const { i18n } = useCoreContext();
    const selectContainerRef = useRef(null);
    const toggleButtonRef = useRef(null);
    const selectListRef = useRef(null);
    const [showList, setShowList] = useState<boolean>(false);
    const [statusMessage, setStatusMessage] = useState<string>(null);
    const selectListId: string = useMemo(() => `select-${uuid()}`, []);

    const active: SelectItem = items.find(i => i.id === selectedValue) || ({} as SelectItem);
    const [activeOption, setActiveOption] = useState<SelectItem>(active);
    const selectedOption = active;

    const suffix = isInvalid ? ARIA_ERROR_SUFFIX : ARIA_CONTEXT_SUFFIX;
    const ariaDescribedBy = uniqueId ? `${uniqueId}${suffix}` : null;

    const openList = () => {
        setShowList(true);
    };

    const scrollToItem = (item: SelectItem) => {
        if (!item) return;
        const nextElement = document.getElementById(`listItem-${item.id}`);
        simulateFocusScroll(nextElement);
    };

    const setNextActive = (navigableItems: SelectItem[]) => {
        if (!navigableItems || navigableItems.length < 1) return;
        const possibleNextIndex = navigableItems.findIndex(listItem => listItem === activeOption) + 1;
        const nextIndex = possibleNextIndex < navigableItems.length ? possibleNextIndex : 0;
        const nextItem = navigableItems[nextIndex];
        scrollToItem(nextItem);
        setActiveOption(nextItem);
    };

    const setPreviousActive = (navigableItems: SelectItem[]) => {
        if (!navigableItems || navigableItems.length < 1) return;
        const possibleNextIndex = navigableItems.findIndex(listItem => listItem === activeOption) - 1;
        const nextIndex = possibleNextIndex < 0 ? navigableItems.length - 1 : possibleNextIndex;
        const nextItem = navigableItems[nextIndex];
        scrollToItem(nextItem);
        setActiveOption(nextItem);
    };

    const extractItemFromEvent = (e: Event, navigableItems: SelectItem[]): SelectItem => {
        const value = (e.currentTarget as HTMLInputElement).getAttribute('data-value');
        return navigableItems.find(listItem => listItem.id == value);
    };

    const handleHover = (navigableItems: SelectItem[], e: Event) => {
        e.preventDefault();
        const item = extractItemFromEvent(e, navigableItems);
        setActiveOption(item);
    };

    const handleNavigationKeys = (e: KeyboardEvent, navigableItems: SelectItem[], handleSelect: (e: Event) => void) => {
        switch (e.key) {
            case keys.space:
            case keys.enter:
                handleSelect(e);
                break;
            case keys.arrowDown:
                e.preventDefault();
                setNextActive(navigableItems);
                break;
            case keys.arrowUp:
                e.preventDefault();
                setPreviousActive(navigableItems);
                break;
            default:
        }
    };

    useEffect(() => {
        onListToggle?.(showList);
    }, [showList]);

    useEffect(() => {
        /**
         * Close the select list when clicking outside the list
         * @param e - MouseEvent
         */
        function handleClickOutside(e: MouseEvent) {
            // use composedPath so it can also check when inside a web component
            // if composedPath is not available fallback to e.target
            const clickIsOutside = e.composedPath
                ? !e.composedPath().includes(selectContainerRef.current)
                : !selectContainerRef.current.contains(e.target);
            if (clickIsOutside) {
                setShowList(false);
            }
        }

        document.addEventListener('click', handleClickOutside, false);

        return () => {
            document.removeEventListener('click', handleClickOutside, false);
        };
    }, [selectContainerRef]);

    /**
     * Update status message for screen readers when no options are found
     */
    useEffect(() => {
        if (showList && items.length === 0) {
            setStatusMessage(i18n.get('select.noOptionsFound'));
        } else {
            setStatusMessage(null);
        }
    }, [showList, items.length, i18n]);

    return {
        selectContainerRef,
        toggleButtonRef,
        selectListRef,
        showList,
        setShowList,
        statusMessage,
        selectListId,
        activeOption,
        setActiveOption,
        selectedOption,
        ariaDescribedBy,
        openList,
        scrollToItem,
        setNextActive,
        setPreviousActive,
        extractItemFromEvent,
        handleHover,
        handleNavigationKeys
    };
}

export default useSelectBase;
