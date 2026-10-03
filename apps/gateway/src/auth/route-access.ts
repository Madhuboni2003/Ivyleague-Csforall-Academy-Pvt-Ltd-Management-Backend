/**
 * First-layer RBAC: which roles may reach which routes.
 *
 * The gateway matches on the `role` claim of the verified JWT. A request with no
 * matching rule is allowed through to the service — this layer restricts the
 * routes named here, it does not grant blanket access to the rest. Per-record
 * and per-brand authorization stays in the services, which own that context.
 */
export type AccessRule = {
    method: string;
    path: string | RegExp;
    roles: readonly string[];
}

const ADMIN_ONLY = ['ADMIN'] as const;

export const accessRules: AccessRule[] = [
    { method: 'POST', path: '/api/v1/users/staff', roles: ADMIN_ONLY },
    {
        method: 'POST',
        path: '/api/v1/users/learners',
        roles: ['SALES'],
    },
    {
        method: 'POST',
        path: /^\/api\/v1\/users\/[^/]+\/brand-access$/,
        roles: ADMIN_ONLY,
    },
    {
        method: 'PATCH',
        path: /^\/api\/v1\/users\/[^/]+\/status$/,
        roles: ADMIN_ONLY,
    },
    {
        method: 'POST',
        path: /^\/api\/v1\/users\/[^/]+\/roles$/,
        roles: ADMIN_ONLY,
    },
    { method: 'POST', path: '/api/v1/tc-versions', roles: ADMIN_ONLY },
    { method: 'POST', path: '/api/v1/brands', roles: ADMIN_ONLY },
    {
        method: 'PATCH',
        path: /^\/api\/v1\/brands\/[^/]+$/,
        roles: ADMIN_ONLY,
    },

    {
        method: 'GET',
        path: /^\/api\/v1\/cases\/[^/]+\/evidence-package$/,
        roles: ['ACADEMIC_HEAD'],
    },
];

export function findAccessRule(
    method: string,
    pathname: string,
): AccessRule | undefined {
    return accessRules.find((rule) => {
        if (rule.method !== method.toUpperCase()) {
            return false;
        }

        return typeof rule.path === 'string'
            ? rule.path === pathname
            : rule.path.test(pathname);
    });
}
