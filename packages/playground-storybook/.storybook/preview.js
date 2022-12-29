import '!style-loader!css-loader!./main.css';
import '!style-loader!css-loader!@adyen/adyen-web/dist/es/adyen.css';

export const parameters = {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/
        }
    }
};

export const decorators = [
    story => {
        const tale = story();

        if (typeof tale === 'string') {
            return `<div class="component-wrapper">${story}</div>`;
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'component-wrapper';
        wrapper.appendChild(tale);
        return wrapper;
    }
];
