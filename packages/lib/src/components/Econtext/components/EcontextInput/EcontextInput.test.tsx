import { h } from 'preact';
import { mount } from 'enzyme';
import EcontextInput from './EcontextInput';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import { setupCoreMock } from '../../../../../config/testMocks/setup-core-mock';

const requiredPropsFromUiElement = {
    showPayButton: false
};

const core = setupCoreMock();

describe('Econtext: EcontextInput', () => {
    test('renders PersonalDetails form by default', () => {
        const wrapper = mount(
            <CoreProvider i18n={core.modules.i18n} loadingContext="test" resources={core.modules.resources}>
                <EcontextInput
                    {...requiredPropsFromUiElement}
                    onChange={jest.fn()}
                    onSubmit={jest.fn()}
                    setComponentRef={jest.fn()}
                    payButton={() => <button className="pay-button" />}
                />
            </CoreProvider>
        );
        expect(wrapper.find('PersonalDetails')).toHaveLength(1);
    });

    test('hide PersonalDetails form if prop personalDetailsRequired is set to false', () => {
        const wrapper = mount(
            <CoreProvider i18n={core.modules.i18n} loadingContext="test" resources={core.modules.resources}>
                <EcontextInput
                    {...requiredPropsFromUiElement}
                    personalDetailsRequired={false}
                    onChange={jest.fn()}
                    onSubmit={jest.fn()}
                    setComponentRef={jest.fn()}
                    payButton={() => <button className="pay-button" />}
                />
            </CoreProvider>
        );
        expect(wrapper.find('PersonalDetails')).toHaveLength(0);
    });

    test('hide PayButton if showPayButton is set to false', () => {
        const wrapper = mount(
            <CoreProvider i18n={core.modules.i18n} loadingContext="test" resources={core.modules.resources}>
                <EcontextInput
                    {...requiredPropsFromUiElement}
                    personalDetailsRequired={false}
                    onChange={jest.fn()}
                    onSubmit={jest.fn()}
                    showPayButton={false}
                    setComponentRef={jest.fn()}
                    payButton={() => <button className="pay-button" />}
                />
            </CoreProvider>
        );
        expect(wrapper.contains(<button className="pay-button" />)).toBeFalsy();
    });

    test('hide form instruction if personalDetailsRequired sets to false', () => {
        const wrapper = mount(
            <CoreProvider i18n={core.modules.i18n} loadingContext="test" resources={core.modules.resources}>
                <EcontextInput
                    {...requiredPropsFromUiElement}
                    personalDetailsRequired={false}
                    onChange={jest.fn()}
                    onSubmit={jest.fn()}
                    setComponentRef={jest.fn()}
                    payButton={() => <button className="pay-button" />}
                />
            </CoreProvider>
        );
        expect(wrapper.find('FormInstruction')).toHaveLength(0);
    });

    test('show form instruction if personalDetailsRequired is set to true', () => {
        const wrapper = mount(
            <CoreProvider i18n={core.modules.i18n} loadingContext="test" resources={core.modules.resources}>
                <EcontextInput
                    {...requiredPropsFromUiElement}
                    personalDetailsRequired
                    onChange={jest.fn()}
                    onSubmit={jest.fn()}
                    setComponentRef={jest.fn()}
                    payButton={() => <button className="pay-button" />}
                />
            </CoreProvider>
        );
        expect(wrapper.find('FormInstruction')).toHaveLength(1);
    });
});
