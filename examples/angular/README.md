# @adyen/adyen-web v6 + Angular 18 with Server Side Rendering

### Steps to run the project:

1. Install the project dependencies: `npm install`
2. Edit the `src/environments/environment.development.ts` file and add there your variables.

Example:

```js
export const environment = {
    production: false,
    clientKey: 'test_L6HTEOAXQBCZ...',
    merchantAccount: 'TestMerchant...',
    apiVersion: 'v71',
    apiKey: 'AQEthmfxKo7MbhFLw0m/n3Q...'
};
```

3. In order to run not only client-side code but also server-side code for local development, run `npm run watch` in one terminal, and `npm run serve:ssr:angular-ssr-prefetch` in another terminal. After doing that, you should be able to see the application running on `http://localhost:4000`

4. [OPTIONAL] Run `npm run analyze-bundle` to get a report of the bundle size. You can find the report in the `<root>/result.html` file.

> [!TIP]
> You can change the countryCode, locale and amount by updating the values in the URL parameters:
>
> `http://localhost:4000/?amount=2000&countryCode=US&shopperLocale=nl-NL`

> [!NOTE]
> This demo is not using the 'auto' package by default. Therefore, you might need to import your specific payment methods in order to see them in the UI.
