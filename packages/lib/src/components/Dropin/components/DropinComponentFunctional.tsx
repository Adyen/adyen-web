import { h } from 'preact';
import { signal } from '@preact/signals';

export const stateSignal = signal(2);

export function MyComponent() {
    return <button onClick={() => stateSignal.value++}>Value: {stateSignal}</button>;
}
