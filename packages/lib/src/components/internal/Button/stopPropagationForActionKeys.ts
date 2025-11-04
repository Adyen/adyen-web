export const stopPropagationForActionKeys = (event: KeyboardEvent): void => {
    if (event.key === 'Enter' || event.code === 'Enter' || event.key === ' ' || event.code === 'Space') {
        event.stopPropagation();
    }
};
