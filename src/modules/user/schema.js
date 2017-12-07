import fs from 'fs';
import {Schema as ResidentSchema} from '../resident';

const UserSchema = fs.readFileSync(__dirname + '/user.graphqls', 'UTF-8');

export function Schema() {
    return [UserSchema, ResidentSchema];
}

export const Resolver = {
    Query: {
        allUsers(obj, args, {userConnector}) {
            return userConnector.getAllUsers();
        },

        user(obj, args, {userConnector}) {
            return userConnector.getUser(args.id);
        }
    },

    User: {
        resident(obj, args, {residentConnector}) {
            if (obj.resident_id) {
                return residentConnector.getResident(obj.resident_id);
            }
            return null;
        },

        superAdmin(obj) {
            return obj.super_admin === '1';
        }
    }
};