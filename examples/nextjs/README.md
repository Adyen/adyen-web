# @adyen/adyen-web v6 + Nextjs 14

### Steps to run the project:

1. Create `env.local` file and add the following variables along with their values:

```
MERCHANT_ACCOUNT=
CHECKOUT_API_KEY=
CHECKOUT_API_VERSION=
NEXT_PUBLIC_CLIENT_KEY=
```

Example:
```
MERCHANT_ACCOUNT=MyTestMerchantAccount
CHECKOUT_API_KEY=AQEthmfxKoMm/n3...
CHECKOUT_API_VERSION=v71
NEXT_PUBLIC_CLIENT_KEY=test_L6HTEOAX...
```

2. Install the project dependencies: `npm install`
3. Run the dev server `npm run dev`. The web application will run on port `http://localhost:3020` .
4. [Optional] Run the production built version by running `npm run build` followed by `npm run start`
5. [Optional] Generate a bundle analysis by running `npm run analyze`.  The report can be seen on `<root>/.next/analyze/client.html` file

> [!TIP]
> You can change the countryCode, locale and amount by updating the values in the URL parameters: 
> 
> ```http://localhost:3020/?amount=2000&countryCode=US&shopperLocale=nl-NL```

> [!NOTE]
> This demo is not using the 'auto' package by default. Therefore, you might need to import your specific payment methods in order to see them in the UI.
