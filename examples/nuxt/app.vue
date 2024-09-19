<template>
    <Head>
        <Title>@adyen/adyen-web + Nuxt3</Title>
    </Head>
    <div>
        <!-- ModeSwitcher component to change the selectedMode -->
        <ModeSwitcher :selectedValue="selectedMode" @click="handleClick" />

        <!-- Conditionally render components based on selectedMode -->
        <AdvancedFlow v-if="selectedMode === 'advanced'" />
        <SessionsFlow v-else-if="selectedMode === 'sessions'" />
    </div>
</template>

<script>
export default {
    data() {
        return {
            selectedMode: 'advanced'
        };
    },
    methods: {
        handleClick(value) {
            console.log(value);
            this.selectedMode = value;
        }
    }
};
</script>
