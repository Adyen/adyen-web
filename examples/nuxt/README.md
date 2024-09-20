# @adyen/adyen-web v6 + Nuxt3

### Steps to run the project:

1. Install the project dependencies: `npm install`
2. Edit the `nuxt.config.ts` file and add there your account details:

Example:

```
runtimeConfig: {
    apiKey: 'AQEthmfxKo7Mb...',
    apiVersion: 'v71',
    merchantAccount: 'TestMerchant...',

    public: {
        clientKey: 'test_L6HTEOAXQBCZ...'
    }
}
```

3. Run `npm run dev`. The web app will be running on `http://localhost:3000`

> [!TIP]
> You can change the countryCode, locale and amount by updating the values in the URL parameters:
>
> `http://localhost:3000/?amount=2000&countryCode=US&shopperLocale=nl-NL`
