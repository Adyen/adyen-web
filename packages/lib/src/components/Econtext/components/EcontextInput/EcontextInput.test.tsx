import { h } from 'preact';
import { shallow } from 'enzyme';
import EcontextInput from './EcontextInput';

describe('Econtext: EcontextInput', () => {
    test('renders PersonalDetails form by default', () => {
        const wrapper = shallow(
            <EcontextInput onChange={jest.fn()} onSubmit={jest.fn()} showPayButton payButton={() => <button className="pay-button" />} />
        );
        expect(wrapper.find('PersonalDetails')).toHaveLength(1);
    });

    test('hide PersonalDetails form if prop personalDetailsRequired is set to false', () => {
        const wrapper = shallow(
            <EcontextInput
                personalDetailsRequired={false}
                onChange={jest.fn()}
                onSubmit={jest.fn()}
                showPayButton
                payButton={() => <button className="pay-button" />}
            />
        );
        expect(wrapper.find('PersonalDetails')).toHaveLength(0);
    });

    test('hide PayButton if showPayButton is set to false', () => {
        const wrapper = shallow(
            <EcontextInput
                personalDetailsRequired={false}
                onChange={jest.fn()}
                onSubmit={jest.fn()}
                showPayButton={false}
                payButton={() => <button className="pay-button" />}
            />
        );
        expect(wrapper.contains(<button className="pay-button" />)).toBeFalsy();
    });
});
