const operations = ['create', 'read', 'update', 'delete'];

export function processRoles(roles) {
    return roles.map(role => {
        if (role.permissions) {
            role.permissions = role.permissions.split(',').map(permission => {
                let objectType = permission.substring(0, permission.indexOf(':'));
                let createOperation = permission.substr(permission.indexOf(':') + 1, 1) === '1';
                let readOperation = permission.substr(permission.indexOf(':') + 2, 1) === '1';
                let updateOperation = permission.substr(permission.indexOf(':') + 3, 1) === '1';
                let deleteOperation = permission.substr(permission.indexOf(':') + 4, 1) === '1';

                return {
                    objectType,
                    create: createOperation,
                    read: readOperation,
                    update: updateOperation,
                    "delete": deleteOperation
                }
            });
        } else {
            role.permissions = [];
        }

        return role;
    });
}

export function permissionsToSql(permissions) {
    let sqlPermissions = null;
    if (permissions) {
        sqlPermissions = '';
        permissions.forEach(permission => {
            if (sqlPermissions.length > 0) {
                sqlPermissions += ',';
            }
            sqlPermissions += permissionToSql(permission);
        });
    }
    return sqlPermissions;
}

export function permissionToSql(permission) {
    let permissionSql = permission.objectType+':';
    permissionSql += permission.create ? '1' : '0';
    permissionSql += permission.read ? '1' : '0';
    permissionSql += permission.update ? '1' : '0';
    permissionSql += permission.delete ? '1' : '0';
    return permissionSql;
}

export function mergePermissions(roles) {
    let permissions = {};

    processRoles(roles).forEach(role => {
        role.permissions.forEach(permission => {
            let objectType = permission.objectType;

            operations.forEach(operation => {
                if (permission[operation]) {
                    let perm = objectType + ':' + operation;
                    permissions[perm] = true;
                }
            });
        });
    });

    return Object.keys(permissions).sort();
}
