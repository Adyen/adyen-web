import 'whatwg-fetch';

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

import 'core-js/es/object/assign';
import 'core-js/es/object/keys';
import 'core-js/es/array/includes';
import 'core-js/es/array/find';
import 'core-js/es/array/find-index';

if (typeof Promise === 'undefined') {
    window.Promise = require('promise/lib/es6-extensions.js');
}
