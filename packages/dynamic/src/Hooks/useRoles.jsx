import { useMemo } from "react";
import { useGQLClient } from "../Store";
import { useCallback } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { ErrorHandler, LoadingSpinner } from "@hrbolek/uoisfrontend-shared";
import { AsyncStateIndicator } from "../../../_template/src/Base/Helpers/AsyncStateIndicator";

/**
 * Normalizace názvů rolí pro porovnávání.
 * - trim
 * - volitelně case-insensitive (zde zapnuto)
 */
const normalizeRoleName = (name) => {
    if (typeof name !== "string") return "";
    return name.trim().toLowerCase();
};

/**
 * Vrací true, pokud mají dvě kolekce alespoň jeden společný prvek.
 * Optimalizované přes Set (O(n+m)).
 *
 * @param {Iterable<string>} a
 * @param {Iterable<string>} b
 * @returns {boolean}
 */
export const hasIntersection = (a, b) => {
    if (!a || !b) return false;

    // vytvoř set z menší kolekce (mikro-optimalizace)
    const arrA = Array.isArray(a) ? a : Array.from(a);
    const arrB = Array.isArray(b) ? b : Array.from(b);

    const small = arrA.length <= arrB.length ? arrA : arrB;
    const large = arrA.length <= arrB.length ? arrB : arrA;

    const set = new Set(small);
    for (const x of large) {
        if (set.has(x)) return true;
    }
    return false;
};

/**
 * useRoles
 *
 * @param {Object} item
 * @param {string[]} oneOfRoles - role names, které povolují akci (stačí jedna)
 * @param {Object} [options]
 * @param {boolean} [options.caseInsensitive=true]
 * @returns {{ can: boolean, roleNames: string[] }}
 */
export const useRoles = (item = {}, oneOfRoles = [], options = {}) => {
    const { caseInsensitive = false } = options;

    const can = useMemo(() => {
        const currentUserRoles = item?.rbacobject?.currentUserRoles ?? [];
        if (!Array.isArray(currentUserRoles) || currentUserRoles.length === 0) return false;
        if (!Array.isArray(oneOfRoles) || oneOfRoles.length === 0) return false;

        const norm = (s) => {
            if (typeof s !== "string") return "";
            const t = s.trim();
            return caseInsensitive ? t.toLowerCase() : t;
        };

        // roleNames uživatele → Set
        const userSet = new Set(
            currentUserRoles
                .map((role) => role?.roletype?.name)
                .map(norm)
                .filter(Boolean)
        );

        // stačí najít jednu shodu
        for (const r of oneOfRoles) {
            if (userSet.has(norm(r))) return true;
        }
        return false;
    }, [item, oneOfRoles, caseInsensitive]);

    // volitelně můžeš vracet i normalizované roleNames (užitečné pro debug/UI)
    const roleNames = useMemo(() => {
        const currentUserRoles = item?.rbacobject?.currentUserRoles ?? [];
        if (!Array.isArray(currentUserRoles)) return [];
        const norm = (s) => {
            if (typeof s !== "string") return "";
            const t = s.trim();
            return caseInsensitive ? t.toLowerCase() : t;
        };
        return currentUserRoles
            .map((role) => role?.roletype?.name)
            .map(norm)
            .filter(Boolean);
    }, [item, caseInsensitive]);

    return { can, roleNames };
};

export const PermissionGate = ({
    item = {},
    roles = [],
    enabled = true,
    deniedFallback = null,
    children,
}) => {
    const { can, roleNames } = useRoles(item, roles, { enabled });

    if (!enabled) return null;

    if (!can) {
        return deniedFallback; // default null
    }

    return typeof children === "function"
        ? children({ can, roleNames })
        : children;
};

const cache = new Map(); // Map<string, CacheEntry<any>>

/**
 * Vrátí cached hodnotu s TTL. Deduplikuje paralelní volání pro stejný key.
 *
 * @template T
 * @param {string} key
 * @param {() => Promise<T>} fetcher
 * @param {{ ttlMs?: number, now?: () => number }} [options]
 * @returns {Promise<T>}
 */
export function getCached(key, fetcher, options = {}) {
    const ttlMs = options.ttlMs ?? 60_000;
    const now = options.now ?? (() => Date.now());
    const t = now();

    /** @type {CacheEntry<T> | undefined} */
    const entry = cache.get(key);

    if (entry && entry.value !== undefined && entry.expiresAt > t) {
        return Promise.resolve(entry.value);
    }

    if (entry && entry.promise && entry.expiresAt > t) {
        return entry.promise;
    }

    const expiresAt = t + ttlMs;
    const p = Promise.resolve()
        .then(fetcher)
        .then((val) => {
            cache.set(key, { value: val, expiresAt });
            return val;
        })
        .catch((err) => {
            cache.delete(key);
            throw err;
        });

    cache.set(key, { promise: p, expiresAt });
    return p;
}

export function invalidateCached(key) {
    cache.delete(key);
}

export function clearCache() {
    cache.clear();
}

export function pruneCache(now = Date.now) {
    const t = now();
    for (const [k, v] of cache.entries()) {
        if (v.expiresAt <= t) cache.delete(k);
    }
}

const queryMe = `
{
  me {
    roles(limit: 1000, where: {valid: {_eq: true}}) {
      roletype {
        __typename
        id
        name
      }
      user {
        __typename
        id
        fullname
      }
      group {
        __typename
        id
        name
      }
    }
  }
}`
/**
 * Načte absolutní role uživatele (z `me.roles.roletype.name`) a cacheuje je s TTL.
 * Vrací i boolean `allowed` podle toho, zda uživatel má alespoň jednu z rolí `oneOfRoles`.
 *
 * @param {string[]} [oneOfRoles=[]] seznam rolí, z nichž stačí mít jednu
 * @param {{ ttlMs?: number, enabled?: boolean, cacheKey?: string }} [options]
 * @returns {{ loading: boolean, allowed: boolean|null, roles: string[], error: any }}
 */
export function useAbsoluteRoles(oneOfRoles = [], options = {}) {
    const gqlClient = useGQLClient();
    const enabled = options.enabled ?? true;
    const ttlMs = options.ttlMs ?? 60_000;

    // cacheKey můžeš přepsat; defaultně cacheujeme role me.
    const cacheKey = options.cacheKey ?? "me.roles";

    const fetcher = useCallback(async () => {
        const response = await gqlClient.query(queryMe);
        const roles = response?.data?.me?.roles ?? [];
        // unikátní názvy rolí
        const names = roles
            .map((r) => r?.roletype?.name)
            .filter(Boolean);

        return Array.from(new Set(names));
    }, [gqlClient]);

    const [state, setState] = useState(() => ({
        loading: !!enabled,
        allowed: /** @type {boolean|null} */ (null),
        roles: /** @type {string[]} */ ([]),
        error: /** @type {any} */ (null),
    }));

    const oneOfSet = useMemo(
        () => new Set((oneOfRoles ?? []).filter(Boolean)),
        [oneOfRoles]
    );

    useEffect(() => {
        let cancelled = false;

        if (!enabled) {
            setState({ loading: false, allowed: null, roles: [], error: null });
            return;
        }

        setState((s) => ({ ...s, loading: true, error: null }));

        getCached(cacheKey, fetcher, { ttlMs })
            .then((roles) => {
                if (cancelled) return;
                const allowed =
                    oneOfSet.size === 0
                        ? true // pokud nepředáš žádné oneOfRoles, beru to jako "nefiltruj"
                        : roles.some((r) => oneOfSet.has(r));

                setState({ loading: false, allowed, roles, error: null });
            })
            .catch((error) => {
                if (cancelled) return;
                setState({ loading: false, allowed: null, roles: [], error });
            });

        return () => {
            cancelled = true;
        };
    }, [enabled, ttlMs, cacheKey, fetcher, oneOfSet]);

    return state;
}

const dummyRoles = []
export const AbsolutePermissionGate = ({
    roles = dummyRoles,
    enabled = true,
    loadingFallback = null,
    children,
}) => {
    const { loading, allowed, error } = useAbsoluteRoles(roles, { enabled });

    if (!enabled) return null;
    return (
        <>  
            {loading && loadingFallback}
            <AsyncStateIndicator error={error} loading={!loadingFallback? loading:false} text="Ověřuji oprávnění" />
            {allowed && children}
        </>
    )
};