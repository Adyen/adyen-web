import Core from '../../src/core';

const getStoryContextCheckout = (context): Core | undefined => {
    const { checkout } = context.loaded;
    return checkout;
};

export { getStoryContextCheckout };
