/**
 * Base class to be extended by the connectors for general purpose utility,
 * such as Authorization and other cross-cutting concerns.
 */
export class BaseConnector {
    constructor(request) {
        this.user = request.user;
    }

    /**
     * Authorization interceptor, to be used to ensure that there is a logged in user
     * and that the user has the correct permissions to perform the operation.
     *
     * @param permission         The permission that must be ensured. This is quite
     *                           simple for now and can be extended if needed in
     *                           the future.
     * @param authorizedCallback The callback that is executed if the operation is
     *                           authorized. The callback MUST return a promise.
     * @param unauthorizedValue  If the operation is not authorized the promise
     *                           resolves per default to null, unless this value
     *                           is specified in which case that value will be
     *                           returned instead.
     * @returns {Promise}
     */
    authz(permission, authorizedCallback, unauthorizedValue = null) {
        return new Promise((resolve) => {
            if (this.user && this.user.permission && this.user.permission.indexOf(permission) > -1) {
                authorizedCallback().then(resolve);
            } else {
                resolve(unauthorizedValue);
            }
        });
    }
}