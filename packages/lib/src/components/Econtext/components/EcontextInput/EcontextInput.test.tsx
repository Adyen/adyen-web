import { h } from 'preact';
import { mount, shallow } from 'enzyme';
import EcontextInput from './EcontextInput';
import CoreProvider from '../../../../core/Context/CoreProvider';

const requiredPropsFromUiElement = {
    showPayButton: false
};

describe('Econtext: EcontextInput', () => {
    test('renders PersonalDetails form by default', () => {
        const wrapper = mount(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                <EcontextInput
                    {...requiredPropsFromUiElement}
                    onChange={jest.fn()}
                    onSubmit={jest.fn()}
                    payButton={() => <button className="pay-button" />}
                />
            </CoreProvider>
        );
        expect(wrapper.find('PersonalDetails')).toHaveLength(1);
    });

    test('hide PersonalDetails form if prop personalDetailsRequired is set to false', () => {
        const wrapper = mount(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                <EcontextInput
                    {...requiredPropsFromUiElement}
                    personalDetailsRequired={false}
                    onChange={jest.fn()}
                    onSubmit={jest.fn()}
                    payButton={() => <button className="pay-button" />}
                />
            </CoreProvider>
        );
        expect(wrapper.find('PersonalDetails')).toHaveLength(0);
    });

    test('hide PayButton if showPayButton is set to false', () => {
        const wrapper = shallow(
            <EcontextInput
                {...requiredPropsFromUiElement}
                personalDetailsRequired={false}
                onChange={jest.fn()}
                onSubmit={jest.fn()}
                showPayButton={false}
                payButton={() => <button className="pay-button" />}
            />
        );
        expect(wrapper.contains(<button className="pay-button" />)).toBeFalsy();
    });

    test('hide form instruction if personalDetailsRequired sets to false', () => {
        const wrapper = shallow(
            <EcontextInput
                {...requiredPropsFromUiElement}
                personalDetailsRequired={false}
                onChange={jest.fn()}
                onSubmit={jest.fn()}
                payButton={() => <button className="pay-button" />}
            />
        );
        expect(wrapper.find('FormInstruction')).toHaveLength(0);
    });

    test('hide form instruction if showFormInstruction sets to false', () => {
        const wrapper = shallow(
            <EcontextInput
                {...requiredPropsFromUiElement}
                showFormInstruction={false}
                onChange={jest.fn()}
                onSubmit={jest.fn()}
                payButton={() => <button className="pay-button" />}
            />
        );
        expect(wrapper.find('FormInstruction')).toHaveLength(0);
    });

    test('show form instruction if personalDetailsRequired and showFormInstruction set to true', () => {
        const wrapper = shallow(
            <EcontextInput
                {...requiredPropsFromUiElement}
                personalDetailsRequired
                showFormInstruction
                onChange={jest.fn()}
                onSubmit={jest.fn()}
                payButton={() => <button className="pay-button" />}
            />
        );
        expect(wrapper.find('FormInstruction')).toHaveLength(1);
    });
});
