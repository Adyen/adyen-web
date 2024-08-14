export async function POST(request: Request, context: any) {
    const body = await request.json();

    const fullRequest = {
        ...body,
        merchantAccount: process.env.MERCHANT_ACCOUNT,
    };

    const res = await fetch(
        `https://checkout-test.adyen.com/${process.env.CHECKOUT_API_VERSION}/payments/details`,
        {
            method: "POST",
            body: JSON.stringify(fullRequest),
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
                "X-Api-Key": process.env.CHECKOUT_API_KEY,
            },
        },
    );

    const response = await res.json();
    return Response.json(response);
}
