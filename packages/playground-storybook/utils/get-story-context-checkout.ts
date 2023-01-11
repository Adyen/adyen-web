import Core from '@adyen/adyen-web/dist/types/core';
import { StoryContext } from '@storybook/html';

const getStoryContextCheckout = (context: StoryContext): Core | undefined => {
    const { checkout } = context.loaded;
    return checkout;
};

export { getStoryContextCheckout };
