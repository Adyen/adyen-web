<template>

    <Head>
        <Title>@adyen/adyen-web + Nuxt3</Title>
    </Head>
    <div>
        <ModeSwitcher :selectedValue="selectedMode" @click="handleClick" />
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
            this.selectedMode = value;
        }
    }
};
</script>
