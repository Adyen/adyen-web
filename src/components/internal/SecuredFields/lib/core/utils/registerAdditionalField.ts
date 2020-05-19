import { on, off, selectOne } from '../../utilities/dom';
import ua from '../../utilities/userAgent';

import * as logger from '../../utilities/logger';

const doLog = false;

const getCaretPos = (pNode: HTMLInputElement | HTMLTextAreaElement): number => {
    if ('selectionStart' in pNode) {
        return pNode.selectionStart;
    }
    return 0;
};

function touchendListener(e: Event): void {
    if (process.env.NODE_ENV === 'development' && doLog) logger.log('### registerAdditionalField::BODY CLICK:: e=', e);

    const targetEl: EventTarget = e.target;

    // If other element is Input or TextArea
    if (targetEl instanceof HTMLInputElement || (HTMLTextAreaElement && targetEl instanceof HTMLTextAreaElement)) {
        // Force caret to show - 'requires' resetting field's value
        const val: string = targetEl.value;

        let caretPos: number = getCaretPos(targetEl);

        let adjFlag = false;

        // For some annoying, iOS Safari, reason if caretPos is at the end of the string then it won't show up
        // - so first decrease it; then set it again, asynchronously
        if (caretPos === val.length) {
            caretPos -= 1;
            adjFlag = true;
        }

        targetEl.value = val;

        if (targetEl.setSelectionRange) {
            targetEl.focus();
            targetEl.setSelectionRange(caretPos, caretPos);

            // Quirky! (see comment above)
            if (adjFlag) {
                caretPos += 1;
                setTimeout(() => {
                    targetEl.setSelectionRange(caretPos, caretPos);
                }, 0);
            }
        }
    } else {
        /**
         * Workaround for iOS/Safari bug where keypad doesn't retract when SF paymentMethod is no longer active
         */
        const hasKeypadFix: boolean = this.config.keypadFix; // to avoid linting no-lonely-if
        if (hasKeypadFix) {
            // Create an input we can add focus to.
            // Otherwise 2nd & sub times the caret gets left in the SF even though it has lost focus and cannot be typed into
            const rootNode: HTMLElement = this.props.rootNode;
            const nuDiv: HTMLInputElement = document.createElement('input');
            nuDiv.style.width = '1px';
            nuDiv.style.height = '1px';
            nuDiv.style.opacity = '0';
            nuDiv.style.fontSize = '18px'; // prevents zoom
            rootNode.appendChild(nuDiv);
            nuDiv.focus(); // Takes caret from SF
            rootNode.removeChild(nuDiv); // Without this numpad will be replaced with text pad
        }
    }

    // Remove listener
    this.destroyTouchendListener(); // eslint-disable-line no-use-before-define

    // Store the fact we have unset the listener
    this.state.registerFieldForIos = false;

    // Clear focus on secured field inputs now this additional field has gained focus
    this.postMessageToAllIframes({ fieldType: 'additionalField', click: true });
}

function handleAdditionalFields(): void {
    // Only do for iOS
    if (!ua.__IS_IOS) return;

    // This works with the touchend handler, below, to allow us to catch click events on non-securedFields elements.
    // re. http://gravitydept.com/blog/js-click-event-bubbling-on-ios
    // We can use this event to:
    // 1. Set focus on these other elements, and
    // 2. Tell SecuredFields that this has happened so they can blur themselves
    const bodyEl: HTMLBodyElement = selectOne(document, 'body');
    bodyEl.style.cursor = 'pointer';

    on(bodyEl, 'touchend', this.touchendListener);

    // Store the fact we have set the listener
    this.state.registerFieldForIos = true;
}

function destroyTouchendListener(): void {
    if (!ua.__IS_IOS) return; // For when fn is called as result of destroy being called on main csf instance

    const bodyEl: HTMLBodyElement = selectOne(document, 'body');
    bodyEl.style.cursor = 'auto';
    off(bodyEl, 'touchend', this.touchendListener);
}

export default {
    touchendListener,
    handleAdditionalFields,
    destroyTouchendListener
};
