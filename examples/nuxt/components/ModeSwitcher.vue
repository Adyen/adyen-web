<script lang="ts">
export default {
    emits: ['click'],
    props: {
        selectedValue: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            CheckoutMode: {
                Advanced: 'advanced',
                Sessions: 'sessions'
            }
        };
    },
    methods: {
        onClick(value: string) {
            this.$emit('click', value);
        }
    }
};
</script>

<template>
    <div class="mode-switcher">
        <button @click="onClick(CheckoutMode.Advanced)" :class="{
            'mode-switcher__button': true,
            'mode-switcher__button--selected': selectedValue === CheckoutMode.Advanced
        }" type="button">
            Advanced flow
        </button>

        <button @click="onClick(CheckoutMode.Sessions)" :class="{
            'mode-switcher__button': true,
            'mode-switcher__button--selected': selectedValue === CheckoutMode.Sessions
        }" type="button">
            Sessions flow
        </button>
    </div>
</template>

<style scoped>
.mode-switcher {
    max-width: 800px;
    margin: auto;
    margin-bottom: 50px;
    display: flex;
    justify-content: space-between;
    gap: 4px;
    padding: 4px 5px;
    background: #ffffff;
    border: 1px solid #b9c4c9;
    border-radius: 6px;
}

.mode-switcher__button {
    font-weight: 500;
    color: #0075ff;
    width: 100%;
    height: 40px;
    flex-grow: 1;
    cursor: pointer;
    background: #ffffff;
    border-radius: 6px;
    border: 0;
    text-align: center;
    transition: background 0.3s ease-out;
}

.mode-switcher__button--selected {
    background: #e5f1ff;
    border: 1.5px solid #0075ff;
    color: #0075ff;
    font-weight: 700;
}

.mode-switcher__button:not(.mode-switcher__button--selected):hover {
    background-color: #f7f8f9;
}
</style>
