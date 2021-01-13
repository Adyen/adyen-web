import { shallow } from 'enzyme';
import useForm from './useForm';
import { h } from 'preact';

describe('useForm', () => {
    const defaultSchema = ['firstName', 'lastName'];

    function HookWrapper(props) {
        const hook = props.hook ? props.hook() : undefined;
        return <div hook={hook} />;
    }

    describe('schema', () => {
        it('should set a default schema', () => {
            const useFormHook = () => useForm({ schema: defaultSchema });
            const wrapper = shallow(<HookWrapper hook={useFormHook} />);
            const { hook } = wrapper.find('div').props();

            const { schema } = hook;
            expect(schema).toBe(defaultSchema);
        });

        it('should update the schema', () => {
            const useFormHook = () => useForm({ schema: defaultSchema });
            const wrapper = shallow(<HookWrapper hook={useFormHook} />);
            let { hook } = wrapper.find('div').props();

            // set schema
            const { setSchema } = hook;
            setSchema([...defaultSchema, 'email']);

            // get updated schema
            ({ hook } = wrapper.find('div').props());
            const { schema } = hook;
            expect(schema).toEqual([...defaultSchema, 'email']);
        });
    });

    describe('handleChangeFor', () => {
        it('should handle changes for a field', () => {
            const useFormHook = () => useForm({ schema: defaultSchema });
            const wrapper = shallow(<HookWrapper hook={useFormHook} />);
            let { hook } = wrapper.find('div').props();

            const firstNameValue = 'John';

            // set a field value
            const { handleChangeFor } = hook;
            handleChangeFor('firstName')(firstNameValue);

            ({ hook } = wrapper.find('div').props());
            const { data, valid, errors } = hook;
            expect(data.firstName).toBe(firstNameValue);
            expect(valid.firstName).toBe(true);
            expect(errors.firstName).toBe(false);
        });
    });
});
