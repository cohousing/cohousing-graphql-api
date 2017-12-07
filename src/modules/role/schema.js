import fs from 'fs';

const RoleSchema = fs.readFileSync(__dirname + '/role.graphqls', 'UTF-8');

export function Schema() {
    return [RoleSchema];
}

export const Resolver = {
    Query: {
        allRoles(obj, args, {roleConnector}) {
            return roleConnector.getAllRoles();
        }
    },

    Mutation: {
        createRole(obj, args, {roleConnector}) {
            return roleConnector.createRole(args.role);
        },

        updateRole(obj, args, {roleConnector}) {
            return roleConnector.updateRole(args.id, args.role);
        },

        connectRolesAndUsers(obj, args, {roleConnector}) {
            return roleConnector.connectRolesAndUsers(args.roleIds, args.userIds);
        },

        disconnectRolesAndUsers(obj, args, {roleConnector}) {
            return roleConnector.disconnectRolesAndUsers(args.roleIds, args.userIds);
        }
    }
};