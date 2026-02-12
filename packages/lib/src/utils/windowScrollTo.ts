const SCROLL_OFFSET_TOP = 100; // Leave some breathing room at the top

export const windowScrollTo = (container: HTMLElement) => {
    if (container) {
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = container.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - SCROLL_OFFSET_TOP;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
};
