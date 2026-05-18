export function hasOwnProperty(obj = {}, prop: string) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}
