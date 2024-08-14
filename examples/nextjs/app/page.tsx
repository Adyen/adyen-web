"use client";

import { Suspense, useCallback, useState } from "react";

import ModeSwitcher, { CheckoutMode } from "@/app/_components/mode-switcher";
import AdvancedFlow from "@/app/_components/advanced-flow";
import SessionsFlow from "@/app/_components/sessions-flow";

export default function Home() {
    const [mode, setMode] = useState<CheckoutMode>(CheckoutMode.Advanced);

    const handleOnModeChange = useCallback((newMode: CheckoutMode) => {
        setMode(newMode);
    }, []);

    return (
        <main>
            <ModeSwitcher selectedValue={mode} onClick={handleOnModeChange} />
            {mode === CheckoutMode.Sessions && (
                <Suspense fallback={"loading"}>
                    <SessionsFlow />
                </Suspense>
            )}
            {mode === CheckoutMode.Advanced && (
                <Suspense fallback={"loading"}>
                    <AdvancedFlow />
                </Suspense>
            )}
        </main>
    );
}
