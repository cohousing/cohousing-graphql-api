import DataLoader from "dataloader/index";
import sort from "dataloader-sort";

import {BaseConnector} from '../baseconnector';
import {InputValidationError} from '../../errors';

import {processRoles, permissionsToSql} from './role';
import {createAudit, OPERATION_CREATE, OPERATION_UPDATE} from "../audit";

export class RoleConnector extends BaseConnector {
    constructor(request) {
        super(request);
        this.db = request.tenant.db;

        this.loader = new DataLoader(ids => {
            return this.db('roles')
                .whereIn('roles.id', ids)
                .then(roles => {
                    return sort(ids, processRoles(roles));
                });
        });
    }

    getAllRoles() {
        return this.authz('role:read').then(() => {
            return this.db('roles').then(roles => {
                return processRoles(roles);
            });
        });
    }

    getRole(id) {
        return this.authz('role:read').then(() => {
            return this.loader.load(id);
        });
    }

    createRole(roleInput) {
        let self = this;
        return self.authz('role:create').then(() => {
            let permissions = permissionsToSql(roleInput.permissions);

            return self.db('roles').insert({
                name: roleInput.name,
                permissions
            }).then(roleIds => {
                let roleId = roleIds[0];
                createAudit(self.db, self.loggedInUser, 'role', roleId, OPERATION_CREATE, {
                    name: {
                        o: null,
                        n: roleInput.name
                    },
                    permissions: {
                        o: null,
                        n: permissions
                    }
                });
                return roleId;
            }).then(roleId => {
                return self.loader.load(roleId);
            });
        });
    }

    updateRole(roleId, roleInput) {
        let self = this;
        return self.authz('role:update').then(() => {
            return self.db('roles')
                .where('id', roleId)
                .then(foundRoles => {
                    if (foundRoles.length !== 1) {
                        throw new Error('No entry found with id ' + roleId);
                    }

                    return foundRoles[0];
                }).then(existingRole => {
                    let permissions = permissionsToSql(roleInput.permissions);

                    return self.db('roles')
                        .where('id', roleId)
                        .update({
                            name: roleInput.name,
                            permissions
                        })
                        .then(() => {
                            return {
                                existingRole,
                                permissions
                            };
                        });
                }).then(result => {
                    createAudit(self.db, self.loggedInUser, 'role', roleId, OPERATION_UPDATE, {
                        name: {
                            o: result.existingRole.name,
                            n: roleInput.name
                        },
                        permissions: {
                            o: result.existingRole.permissions,
                            n: result.permissions
                        }
                    });

                    return self.loader.load(roleId);
                });
        });
    }

    connectRolesAndUsers(roleIds, userIds) {
        let self = this;
        return self.authz('role:update').then(() => {
            return self.db.transaction(trx => {
                return self._disconnectRolesAndUsers(roleIds, userIds, trx).then(() => {
                    let rolesUsers = [];
                    roleIds.forEach(roleId => {
                        userIds.forEach(userId => {
                            rolesUsers.push({
                                role_id: roleId,
                                user_id: userId
                            })
                        });
                    });

                    return this.db('users_roles')
                        .transacting(trx)
                        .insert(rolesUsers);
                }).then(() => {
                    return true;
                });
            });
        });
    }

    disconnectRolesAndUsers(roleIds, userIds) {
        let self = this;
        return self.authz('role:update').then(() => {
            return self.db.transaction(trx => {
                return self._disconnectRolesAndUsers(roleIds, userIds, trx);
            });
        });
    }

    _disconnectRolesAndUsers(roleIds, userIds, trx) {
        return this.db
            .transacting(trx)
            .countDistinct('roles.id as roleCount')
            .countDistinct('users.id as userCount')
            .from('roles')
            .joinRaw(', users')
            .whereIn('roles.id', roleIds)
            .whereIn('users.id', userIds)
            .first()
            .then(count => {
                let foundRoleCount = parseInt(count.roleCount);
                let foundUserCount = parseInt(count.userCount);

                if (roleIds.length !== foundRoleCount || userIds.length !== foundUserCount) {
                    throw new InputValidationError({
                        message: "Couldn't find all roles or users",
                        data: {
                            expectedRoleCount: roleIds.length,
                            foundRoleCount: foundRoleCount,
                            expectedUserCount: userIds.length,
                            foundUserCount: foundUserCount
                        }
                    });
                }

                return this.db('users_roles')
                    .transacting(trx)
                    .whereIn('role_id', roleIds)
                    .whereIn('user_id', userIds)
                    .del();
            }).then(() => {
                return true;
            });
    }
}

