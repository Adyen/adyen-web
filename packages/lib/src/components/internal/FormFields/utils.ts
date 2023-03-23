const convertFullToHalf = str => str.replace(/[！-～]/g, r => String.fromCharCode(r.charCodeAt(0) - 0xfee0));

/**
 * This function scrolls and element to view and simulates the default behaviour of .focus() by a given browser
 * This function is inspired, yet simplified of the code found here https://gist.github.com/hsablonniere/2581101
 * @param element - element to focus
 */
const simulateFocusScroll = (element: HTMLElement) => {
    const parent = element.parentNode as HTMLElement;
    const parentComputedStyle = window.getComputedStyle(parent, null);
    const parentBorderTopWidth = parseInt(parentComputedStyle.getPropertyValue('border-top-width'));
    const overTop = element.offsetTop - parent.offsetTop < parent.scrollTop;
    const overBottom = element.offsetTop - parent.offsetTop + element.clientHeight - parentBorderTopWidth > parent.scrollTop + parent.clientHeight;

    if (overTop || overBottom) {
        parent.scrollTop = element.offsetTop - parent.offsetTop - parent.clientHeight / 2 - parentBorderTopWidth + element.clientHeight / 2;
    }
};

export { convertFullToHalf, simulateFocusScroll };
