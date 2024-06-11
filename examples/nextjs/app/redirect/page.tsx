"use client";

import { Suspense } from "react";
import Redirect from "@/app/_components/redirect";

export default function RedirectPage() {
    return (
        <main id="redirect-result-page">
            <h1>Redirect Result Page</h1>

            <Suspense fallback={"loading"}>
                <Redirect />
            </Suspense>
        </main>
    );
}
