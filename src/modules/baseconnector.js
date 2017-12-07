import {UnauthorizedError} from '../errors';

/**
 * Base class to be extended by the connectors for general purpose utility,
 * such as Authorization and other cross-cutting concerns.
 */
export class BaseConnector {
    constructor(request) {
        this.user = request.user;
        this.loggedInUser = request.loggedInUser;
    }

    /**
     * Authorization interceptor, to be used to ensure that there is a logged in user
     * and that the user has the correct permissions to perform the operation.
     *
     * @param permission         The permission that must be ensured. This is quite
     *                           simple for now and can be extended if needed in
     *                           the future.
     * @returns {Promise}
     */
    authz(permission) {

        let self = this;
        return new Promise((resolve, reject) => {
            if (self.user && self.user.sa || (self.user.permission && self.user.permission.indexOf(permission) > -1)) {
                resolve();
            } else {
                reject(new UnauthorizedError({
                    data: {
                        permission
                    }
                }));
            }
        });
    }
}