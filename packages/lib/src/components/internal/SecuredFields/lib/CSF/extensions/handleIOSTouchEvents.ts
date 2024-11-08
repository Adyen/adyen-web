import { selectOne } from '../../utilities/dom';
import ua from '../utils/userAgent';
import { on, off } from '../../../../../../utils/listenerUtils';

const getCaretPos = (pNode: HTMLInputElement | HTMLTextAreaElement): number => {
    if ('selectionStart' in pNode) {
        return pNode.selectionStart;
    }
    return 0;
};

/**
 * Detect if touched element is an input or textArea.
 * - If it is do some quirky shit to set focus and caret position on this element
 * - Else do some quirky shit to make the iOS keyboard retract
 *
 * Always then remove this listener and set var saying we have done so (read in CSF...handleFocus)
 * Tell all securedFields some other element now has focus so they can blur themselves
 *
 * @param e -
 */
function touchendListener(e: Event): void {
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

        /**
         * If the input element is of an unexpected type (perhaps the merchant is using a custom button that is an input element, type="button", or,
         * it is something presented in the 3DS2 flow - both, TBC) then this next line will not work.
         * However, the input element still has a setSelectionRange property of type "function", but trying to call it will throw an error...
         * so, try, to see if setSelectionRange can be called
         */
        try {
            if (targetEl.setSelectionRange) {
                targetEl.focus();
                targetEl.setSelectionRange(caretPos, caretPos);

                // Quirky! (see comment about iOS Safari, above)
                if (adjFlag) {
                    caretPos += 1;
                    setTimeout(() => {
                        targetEl.setSelectionRange(caretPos, caretPos);
                    }, 0);
                }
            }
            /* eslint-disable-next-line */
        } catch (e) {}
    } else {
        /**
         * Workaround for iOS/Safari bug where keypad doesn't retract when SF paymentMethod is no longer active
         */
        const hasKeypadFix: boolean = this.config.keypadFix; // to avoid linting no-lonely-if
        if (hasKeypadFix) {
            // Create an input we can add focus to.
            // Otherwise 2nd & sub times the caret gets left in the SF even though it has lost focus and cannot be typed into
            const rootNode: HTMLElement = this.props.rootNode;
            const nuInput: HTMLInputElement = document.createElement('input');
            nuInput.style.width = '1px';
            nuInput.style.height = '1px';
            nuInput.style.opacity = '0';
            nuInput.style.fontSize = '18px'; // prevents zoom
            rootNode.appendChild(nuInput);
            nuInput.focus(); // Takes caret from SF
            rootNode.removeChild(nuInput); // Without this numpad will be replaced with text pad
        }
    }

    // Remove listener - it gets reset by next call to handleAdditionalFields from handleFocus
    this.destroyTouchendListener();

    // Store the fact we have unset the listener
    this.state.registerFieldForIos = false;

    // Clear focus on secured field inputs now this checkout element has gained focus
    this.postMessageToAllIframes({ fieldType: 'webInternalElement', fieldClick: true });
}

/**
 * re. Disabling arrow keys in iOS - need to enable all fields in the form and tell SFs to disable
 *
 * NOTE: Only called when iOS detected & this.props.shouldDisableIOSArrowKeys = true
 */
function touchstartListener(e: Event): void {
    this.hasGenuineTouchEvents = true;
    const targetEl: EventTarget = e.target;
    // If other element is Input or Span (i.e. label text) TODO apply to other types of el?
    if (targetEl instanceof HTMLInputElement || targetEl instanceof HTMLSpanElement) {
        this.postMessageToAllIframes({ fieldType: 'webInternalElement', checkoutTouchEvent: true });

        const name = targetEl.getAttribute('name') ?? targetEl.getAttribute('data-id'); // if targetEl is a label's span it will only have a data-id
        this.callbacks.onTouchstartIOS?.({ fieldType: 'webInternalElement', name });
    }
}

/**
 * This works with the touchend handler to allow us to catch (click) events on non-securedFields elements
 * (re. http://gravitydept.com/blog/js-click-event-bubbling-on-ios - events don't bubble unless the click takes place on a link or input)
 *
 * We can use this event to:
 * 1. Set focus on these other elements, and
 * 2. Tell SecuredFields that this has happened so they can blur themselves
 * (see note in adyen-secured-fields...inputBase.js - "Blur event never fires on input field")
 *
 * NOTE: Only called when iOS detected
 */
function handleTouchend(): void {
    const bodyEl: HTMLBodyElement = selectOne(document, 'body');
    bodyEl.style.cursor = 'pointer';

    on(bodyEl, 'touchend', this.touchendListener);

    // Store the fact we have set the listener
    this.state.registerFieldForIos = true;
}

function destroyTouchendListener(): boolean {
    if (!ua.__IS_IOS) return false; // For when fn is called as result of destroy being called on main csf instance

    const bodyEl: HTMLBodyElement = selectOne(document, 'body');
    bodyEl.style.cursor = 'auto';
    off(bodyEl, 'touchend', this.touchendListener);
    return true;
}

function destroyTouchstartListener(): boolean {
    if (!ua.__IS_IOS) return false; // For when fn is called as result of destroy being called on main csf instance

    off(document, 'touchstart', this.touchstartListener);
    return true;
}

export default {
    touchendListener,
    touchstartListener,
    handleTouchend,
    destroyTouchendListener,
    destroyTouchstartListener
};
