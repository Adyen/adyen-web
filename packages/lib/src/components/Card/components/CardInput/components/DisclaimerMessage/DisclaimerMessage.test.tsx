import { shallow } from 'enzyme';
import { h } from 'preact';
import DisclaimerMessage from './DisclaimerMessage';

describe('DisclaimerMessage', () => {
    const disclaimerMessage = {
        message: 'By continuing you accept the %{linkText} of MyStore',
        linkText: 'terms and conditions',
        link: 'https://www.adyen.com'
    };

    const getWrapper = prop => shallow(<DisclaimerMessage disclaimer={prop} />);

    test('Renders the DisclaimerMessage with text before and after the link', () => {
        const wrapper = getWrapper(disclaimerMessage);
        expect(wrapper.find('.adyen-checkout-disclaimer__label')).toHaveLength(1);
        expect(wrapper.find('.adyen-checkout-disclaimer__label').text()).toContain('By continuing you accept the terms and conditions of MyStore');

        expect(wrapper.find('.adyen-checkout__link')).toHaveLength(1);
        expect(wrapper.find('.adyen-checkout__link').text()).toContain('terms and conditions');

        expect(wrapper.find('[href="https://www.adyen.com"]')).toHaveLength(1);
    });

    test('Renders the DisclaimerMessage just with text before the link', () => {
        const nuMsg = { ...disclaimerMessage };
        nuMsg.message = 'By continuing you accept the %{linkText}';

        const wrapper = getWrapper(nuMsg);
        expect(wrapper.find('.adyen-checkout-disclaimer__label')).toHaveLength(1);
        expect(wrapper.find('.adyen-checkout-disclaimer__label').text()).toContain('By continuing you accept the terms and conditions');

        expect(wrapper.find('.adyen-checkout__link')).toHaveLength(1);
        expect(wrapper.find('.adyen-checkout__link').text()).toContain('terms and conditions');

        expect(wrapper.find('[href="https://www.adyen.com"]')).toHaveLength(1);
    });

    test("Doesn't render the DisclaimerMessage because the link is not https", () => {
        const nuMsg = { ...disclaimerMessage };
        nuMsg.link = 'http://www.adyen.com';

        const wrapper = getWrapper(nuMsg);
        expect(wrapper.find('.adyen-checkout-disclaimer__label')).toHaveLength(0);
    });

    test("Doesn't render the DisclaimerMessage because the linkText is not a string", () => {
        const nuMsg = { ...disclaimerMessage };

        /* eslint-disable-next-line */
        nuMsg.linkText = <script>alert("busted")</script>;

        const wrapper = getWrapper(nuMsg);
        expect(wrapper.find('.adyen-checkout-disclaimer__label')).toHaveLength(0);
    });

    test("Doesn't render the DisclaimerMessage because the message is not a string", () => {
        const nuMsg = { ...disclaimerMessage };
        // @ts-ignore allow assignment
        nuMsg.message = {};

        const wrapper = getWrapper(nuMsg);
        expect(wrapper.find('.adyen-checkout-disclaimer__label')).toHaveLength(0);
    });
});
