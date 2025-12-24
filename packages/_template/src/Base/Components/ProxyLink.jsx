import React from "react";
import { useCallback } from "react";
import { useMemo } from "react";
import { Link, useResolvedPath } from "react-router-dom";
import { useNavigate } from 'react-router'
/**
 * shared module.
 * @module shared/components
 */


/**
 * useLink
 *
 * Spočítá cílový odkaz pro react-router <Link>, včetně volitelného zachování
 * aktuálního hash/search. Zároveň určí, zda je cílová cesta "lokální"
 * (tj. stejný base segment jako aktuální app), a podle toho doporučí reloadDocument.
 *
 * @param {Object} args
 * @param {string} args.to - cílová cesta nebo URL (relativní/absolutní)
 * @param {boolean} [args.preserveHash=true] - pokud cílové `to` nemá hash, použij aktuální hash
 * @param {boolean} [args.preserveSearch=true] - pokud cílové `to` nemá search, použij aktuální search
 *
 * @returns {{
 *   href: string,
 *   pathname: string,
 *   search: string,
 *   hash: string,
 *   isLocal: boolean,
 *   reloadDocument: boolean
 * }}
 */
export const useLink = ({
    to,
    preserveHash = true,
    preserveSearch = true,
} = {}) => {
    
    const resolved = useResolvedPath(to);
    // const navigate = useNavigate()
    const navigate = () => null

    const follow = useCallback(() => navigate(href), [navigate])
    
    return useMemo(() => {
        // SSR-safe guard
        const origin =
            typeof window !== "undefined" ? window.location.origin : "http://localhost";
        const currentHref =
            typeof window !== "undefined" ? window.location.href : `${origin}/`;

        const { pathname } = resolved;          // resolved target pathname
        const base = pathname.split("/")[1] || ""; // first segment

        const currentUrl = new URL(currentHref);
        const currentHash = preserveHash ? currentUrl.hash : "";
        const currentSearch = preserveSearch ? currentUrl.search : "";

        // Resolve `to` as URL (handles both relative paths and absolute URLs)
        const destinationUrl = new URL(to, origin);

        // If destination does not specify search/hash, inherit current ones
        destinationUrl.search = destinationUrl.search || currentSearch;
        destinationUrl.hash = destinationUrl.hash || currentHash;

        const href = destinationUrl.pathname + destinationUrl.search + destinationUrl.hash;

        const isLocal =
            typeof window !== "undefined"
                ? window.location.pathname.startsWith(`/${base}`)
                : true;
        
        return {
            follow,
            href,
            pathname: destinationUrl.pathname,
            search: destinationUrl.search,
            hash: destinationUrl.hash,
            isLocal,
            reloadDocument: !isLocal,
        };
    }, [to, preserveHash, preserveSearch, resolved]);
};

/**
 * A `ProxyLink` component that conditionally reloads the document based on whether the link's target
 * is local or external. It also preserves existing hash and query parameters from the current URL
 * and appends them to the target path if they are not already specified.
 *
 * @param {Object} props - The properties for the ProxyLink component.
 * @param {string} props.to - The target path or URL for the link.
 * @param {React.ReactNode} props.children - The content to render inside the link.
 * @param {boolean} [props.preserveHash=true] - Flag indicating whether to preserve the current URL's hash.
 * @param {boolean} [props.preserveSearch=true] - Flag indicating whether to preserve the current URL's query parameters.
 * @param {Object} [props.others] - Additional props to pass to the underlying React Router `Link` component.
 *
 * @returns {JSX.Element} A React Router `Link` component with conditional reload behavior and parameter preservation.
 *
 * @example
 * // Example usage:
 * <ProxyLink to="/local-path">Local Link</ProxyLink>
 * <ProxyLink to="https://external-site.com">External Link</ProxyLink>
 */
export const ProxyLink = ({ to, children, preserveHash = true, preserveSearch = true, ...others }) => {
    const { href, reloadDocument } = useLink({ to, preserveHash, preserveSearch });

    return (
        <Link to={href} reloadDocument={reloadDocument} {...others}>
            {children}
        </Link>
    );
};

