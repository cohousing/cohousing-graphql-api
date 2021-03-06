import crypto from 'crypto';
import DataLoader from 'dataloader';
import sort from 'dataloader-sort';

import {BaseConnector} from '../baseconnector';
import {createAudit, OPERATION_CREATE, OPERATION_UPDATE} from "../audit";

import {UsernameNotAvailableError, ResidentDoesNotExistError, UserDoesNotExistError} from './errors';

export class UserConnector extends BaseConnector {
    constructor(request) {
        super(request);
        this.db = request.tenant.db;

        this.loader = new DataLoader(ids => {
            return this.db('users')
                .whereIn('id', ids)
                .then(data => {
                    return sort(ids, data);
                });
        });
    }

    getAllUsers() {
        return this.authz('user:read').then(() => {
            return this.db('users').then(data => {
                return data;
            });
        });
    }

    getUser(id) {
        return this.authz('user:read').then(() => {
            return this.loader.load(id);
        });
    }

    getUsers(ids) {
        return this.authz('user:read').then(() => {
            return this.loader.loadMany(ids);
        });
    }

    createUser(username, password, residentId, superAdmin) {
        if (!residentId) residentId = null;

        let self = this;
        return self.authz('user:create')
            .then(self._checkUsername(username))
            .then(self._checkResidentExists(residentId))
            .then(() => {
                let salt = crypto.randomBytes(32).toString('hex');
                let generatedPassword = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

                return self.db('users').insert({
                    username,
                    password: generatedPassword,
                    salt,
                    resident_id: residentId,
                    super_admin: superAdmin
                }).then((id) => {
                    self._createCreateAudit(id, username, residentId, superAdmin);
                    return self.loader.load(id[0]);
                });
            });
    }

    updateUser(id, residentId, superAdmin) {
        if (!residentId) residentId = null;

        let existingUser;

        let self = this;
        return self.authz('user:update')
            .then(self._checkExistingUser(id))
            .then(foundUser => {
                existingUser = foundUser;
                return true;
            })
            .then(self._checkResidentExists(residentId))
            .then(() => {
                return self.db('users')
                    .where('id', id)
                    .update({
                        resident_id: residentId,
                        super_admin: superAdmin
                    }).then(() => {
                        self._createUpdateAudit(id, existingUser, residentId, superAdmin);
                        return self.loader.load(id);
                    });
            });
    }

    _checkUsername(username) {
        let self = this;
        return () => {
            return self.db('users')
                .countDistinct('username as usernameCount')
                .where('username', username)
                .first().then(count => {
                    if (count.usernameCount > 0) {
                        throw new UsernameNotAvailableError();
                    }
                    return true;
                });
        };
    }

    _checkResidentExists(residentId) {
        let self = this;
        return () => {
            return Promise.resolve(true)
                .then(() => {
                    if (residentId) {
                        return self.db('residents')
                            .where('id', residentId)
                            .first();
                    } else {
                        return true;
                    }
                }).then(residentExist => {
                    if (!residentExist) {
                        throw new ResidentDoesNotExistError({
                            data: {
                                residentId: residentId
                            }
                        })
                    }
                    return true;
                });
        };
    }

    _checkExistingUser(id) {
        let self = this;
        return () => {
            return self.db('users')
                .where('id', id)
                .first()
                .then(foundUser => {
                    if (!foundUser) {
                        throw new UserDoesNotExistError({
                            data: {
                                userId: id
                            }
                        });
                    }
                    return foundUser;
                });
        };
    }

    _createCreateAudit(id, username, residentId, superAdmin) {
        let self = this;
        createAudit(self.db, self.loggedInUser, 'user', id, OPERATION_CREATE, {
            username: {
                o: null,
                n: username
            },
            residentId: {
                o: null,
                n: residentId
            },
            superAdmin: {
                o: null,
                n: superAdmin
            }
        });
    }

    _createUpdateAudit(id, existingUser, residentId, superAdmin) {
        let self = this;
        createAudit(self.db, self.loggedInUser, 'user', id, OPERATION_UPDATE, {
            residentId: {
                o: existingUser.resident_id ? existingUser.resident_id : null,
                n: residentId
            },
            superAdmin: {
                o: existingUser.super_admin === '1',
                n: superAdmin
            }
        });
    }
}
