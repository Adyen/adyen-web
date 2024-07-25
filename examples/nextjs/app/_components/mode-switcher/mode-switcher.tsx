import React from "react";
import classnames from "classnames";
import "./mode-switcher.css";

export enum CheckoutMode {
    Advanced = "advanced",
    Sessions = "sessions",
}

interface ModeSwitcherProps {
    selectedValue: CheckoutMode;
    onClick(value: string): void;
}

const ModeSwitcher = ({ selectedValue, onClick }: ModeSwitcherProps) => {
    return (
        <div className="mode-switcher">
            <button
                onClick={() => onClick(CheckoutMode.Advanced)}
                className={classnames("mode-switcher__button", {
                    "mode-switcher__button--selected":
                        selectedValue === CheckoutMode.Advanced,
                })}
                type="button"
            >
                Advanced flow
            </button>

            <button
                onClick={() => onClick(CheckoutMode.Sessions)}
                className={classnames("mode-switcher__button", {
                    "mode-switcher__button--selected":
                        selectedValue === CheckoutMode.Sessions,
                })}
                type="button"
            >
                Sessions flow
            </button>
        </div>
    );
};

export default ModeSwitcher;
