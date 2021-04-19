import 'core-js/es/object/assign';
import 'core-js/es/object/keys';
import 'core-js/es/array/includes';
import 'core-js/es/array/find';
import 'core-js/es/array/find-index';
import 'core-js/es/promise';

// ChildNode.remove()
(function(arr) {
    arr.forEach(function(item) {
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
    });
})([Element.prototype, CharacterData.prototype, DocumentType.prototype]);
