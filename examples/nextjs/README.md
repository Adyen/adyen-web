# @adyen/adyen-web v6 + Nextjs 14

### Steps to run the project:

1. Create `env.local` file and add the following variables along with their values:

```
MERCHANT_ACCOUNT={YOUR_MERCHANT_ACCOUNT}
CHECKOUT_API_KEY={YOUR_API_KEY}
CHECKOUT_API_VERSION={YOUR_API_VERSION}
NEXT_PUBLIC_CLIENT_KEY={YOUR_CLIENT_KEY_HERE}
```

2. Install the project dependencies
3. Run the dev server `npm run dev`. The web application will run on port `3020` . You can change that by updating the port in the `package.json` file
4. Change the country/amount/locale settings in the `constants.ts` file

> [!TIP]
> You can change the countryCode, locale and amount by updating the values in the URL parameters: 
> 
> ```http://localhost:3020/?amount=2000&countryCode=US&shopperLocale=nl-NL```

> [!NOTE]
> This demo is not using the 'auto' package by default. Therefore, you might need to import your specifc payment methods in order to see them in the UI.
