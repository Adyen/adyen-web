import Core from '@adyen/adyen-web/dist/types/core';

const getStoryContextCheckout = (context): Core | undefined => {
    const { checkout } = context.loaded;
    return checkout;
};

export { getStoryContextCheckout };
