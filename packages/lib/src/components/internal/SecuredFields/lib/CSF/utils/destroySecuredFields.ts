import SecuredField from '../../securedField/SecuredField';

export function destroySecuredFields(): void {
    // Tell all securedFields iframes: they will remove all event listeners including keyboard events
    this.postMessageToAllIframes({ destroy: true });

    // Get ref to all the keys under which SecuredField instances are stores
    const securedFieldKeys: string[] = Object.keys(this.state.securedFields);

    // Tell each SecuredField instance to:
    // stop listening to message events, remove iframe window refs, remove iframes
    // Then remove ref to SecuredField instance
    securedFieldKeys.forEach(pFieldType => {
        const sf: SecuredField = this.state.securedFields[pFieldType];
        if (sf) sf.destroy(); // Comment out if you want to test the 'destroy' effects in the actual SF
        this.state.securedFields[pFieldType] = null;
    });
    // --

    // Stop listening to touchend event on body (iOS only)
    this.destroyTouchendListener();
    // Stop listening to touchstart event on document (iOS only)
    this.destroyTouchstartListener();

    // Clear SecuredField storage object
    this.state.securedFields = {};
}
