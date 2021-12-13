(function() {
    function polyfill(item) {
        if (item.hasOwnProperty('remove')) {
            return;
        }
        Object.defineProperty(item, 'remove', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: function remove() {
                if (this.parentNode === null) {
                    return;
                }
                this.parentNode.removeChild(this);
            }
        });
    }

    if (typeof Element !== 'undefined') {
        polyfill(Element.prototype);
    }
    if (typeof CharacterData !== 'undefined') {
        polyfill(CharacterData.prototype);
    }
    if (typeof DocumentType !== 'undefined') {
        polyfill(DocumentType.prototype);
    }
})();