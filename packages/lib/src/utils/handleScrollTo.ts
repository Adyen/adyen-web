export const handleScrollTo = (container: HTMLElement) => {
    if (container) {
        const offset = 100; // Leave some breathing room at the top
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = container.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
};
