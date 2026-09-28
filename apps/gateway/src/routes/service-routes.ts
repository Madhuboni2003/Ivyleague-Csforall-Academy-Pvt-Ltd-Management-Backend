/**
 * Route table for the gateway.
 *
 * Each entry proxies a public path prefix through to the service that owns it.
 * `rewritePrefix` is kept identical to `prefix` because every service mounts its
 * routes under the same public path it is reached by (setGlobalPrefix('/api')
 * plus URI versioning), so no path translation is needed.
 *
 * Adding a service means adding entries here — nothing else in the gateway changes.
 */
export interface ServiceRoute {
    prefix: string;
    upstream: string;
}

const identityAccess =
    process.env.IDENTITY_ACCESS_URL ?? 'http://localhost:3001';

const learnerLifecycle =
    process.env.LEARNER_LIFECYCLE_URL ?? 'http://localhost:3002';

export const serviceRoutes: ServiceRoute[] = [
    { prefix: '/api/v1/auth', upstream: identityAccess },
    { prefix: '/api/v1/users', upstream: identityAccess },
    { prefix: '/api/v1/brands', upstream: identityAccess },
    { prefix: '/api/v1/tc-versions', upstream: identityAccess },
    { prefix: '/api/v1/learners', upstream: learnerLifecycle },
];
