# @adyen/adyen-web v6 + Nuxt3

### Steps to run the project:

1. Install the project dependencies: `npm install`
2. Create the `.env` file and add there your account details:

Example:
```
# SERVER 
NUXT_CHECKOUT_API_KEY=AQEthmff3VfI5eG...
NUXT_API_VERSION=v71
NUXT_MERCHANT_ACCOUNT=TestMerchant...

# CLIENT
NUXT_PUBLIC_CLIENT_KEY=test_L6HTEOAXQB...
```

3. Run `npm run dev`. The web app will be running on `http://localhost:3000`

> [!TIP]
> You can change the countryCode, locale and amount by updating the values in the URL parameters:
>
> `http://localhost:3000/?amount=2000&countryCode=US&shopperLocale=nl-NL`
