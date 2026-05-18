import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import ThreeDS2Form from './ThreeDS2Form';

const submitMock = jest.fn();
(global as any).HTMLFormElement.prototype.submit = () => submitMock;

const propsMock = {
    name: 'testForm',
    action: '',
    target: '',
    inputName: 'testInput',
    inputValue: ''
};

describe('<ThreeDS2Form /> rendering', () => {
    test('should render one input field', () => {
        render(<ThreeDS2Form {...propsMock} onFormSubmit={() => {}} />);
        expect(screen.getByRole('textbox', { hidden: true })).toBeInTheDocument();
    });

    test('should render one form', () => {
        render(<ThreeDS2Form {...propsMock} onFormSubmit={() => {}} />);
        expect(screen.getByRole('form', { hidden: true })).toBeInTheDocument();
    });
});
