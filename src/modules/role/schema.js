import fs from 'fs';

import {Permission} from './permission';

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

    Role: {
        home(obj) {
            return Permission.fromSqlValue(obj.home);
        },

        resident(obj) {
            return Permission.fromSqlValue(obj.resident);
        },

        role(obj) {
            return Permission.fromSqlValue(obj.role);
        }
    }
};