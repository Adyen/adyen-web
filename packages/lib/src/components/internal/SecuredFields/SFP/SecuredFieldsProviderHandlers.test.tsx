import { shallow } from 'enzyme';
import SecuredFieldsProvider from './SecuredFieldsProvider';
import { h } from 'preact';

const renderFn = jest.fn(() => {});

describe('<SecuredFieldsProvider /> handling an Enter key pressed event', () => {
    it('should handle a key pressed event and since it is from the Enter key call the handleKeyPress function passed as a prop', () => {
        let keyPressObj: any;

        const handleKeyPress = jest.fn(obj => {
            keyPressObj = obj;
        });

        const wrapper = shallow(<SecuredFieldsProvider render={renderFn} handleKeyPress={handleKeyPress} />);

        const sfpInstance = wrapper.instance();

        sfpInstance.handleKeyPressed({
            action: 'enterKeyPressed',
            fieldType: 'encryptedCardNumber'
        });

        expect(handleKeyPress).toHaveBeenCalled();
        expect(keyPressObj).toBeInstanceOf(KeyboardEvent);
    });

    it('should handle a key pressed event and since it is not from the Enter key should not call the handleKeyPress function', () => {
        const handleKeyPress = jest.fn(() => {});

        const wrapper = shallow(<SecuredFieldsProvider render={renderFn} handleKeyPress={handleKeyPress} />);

        const sfpInstance = wrapper.instance();

        sfpInstance.handleKeyPressed({
            action: 'shiftKeyPressed',
            fieldType: 'encryptedCardNumber'
        });

        expect(handleKeyPress).not.toHaveBeenCalled();
    });
});
