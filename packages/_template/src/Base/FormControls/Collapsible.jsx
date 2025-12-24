import React, { useCallback, useEffect, useState } from "react";

export const Collapsible = ({
    collapsed = true,
    children,
    buttonLabel,
    buttonLabelCollapsed = "Zobrazit",
    buttonLabelExpanded = "Skrýt",
    onToggle,
    ...buttonProps
}) => {
    const [isCollapsed, setIsCollapsed] = useState(collapsed);

    useEffect(() => {
        setIsCollapsed(collapsed);
    }, [collapsed]);

    const toggle = useCallback(() => {
        setIsCollapsed(prev => {
            const next = !prev;
            onToggle?.(next);
            return next;
        });
    }, [onToggle]);

    const label =
        buttonLabel ?? (isCollapsed ? buttonLabelCollapsed : buttonLabelExpanded);

    return (
        <>
            {/* children zůstávají namountované => jejich state se neztratí */}
            <div hidden={isCollapsed} aria-hidden={isCollapsed}>
                {children}
            </div>

            <button
                type="button"
                {...buttonProps}
                onClick={toggle}
                aria-expanded={!isCollapsed}
            >
                {label}
            </button>
        </>
    );
};
