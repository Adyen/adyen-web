export default {
    input: {
        default: () => true
    },
    blur: {
        shopperEmail: email => /\S+@\S+\.\S+/.test(email),
        default: () => true
    }
};
