import fs from 'fs';

const UserSchema = fs.readFileSync(__dirname + '/user.graphqls', 'UTF-8');

export function Schema() {
    return [UserSchema];
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

    Mutation: {
        createUser(obj, args, {userConnector}) {
            return userConnector.createUser(args.username, args.password, args.residentId, args.superAdmin);
        },

        updateUser(obj, args, {userConnector}) {
            return userConnector.updateUser(args.id, args.residentId, args.superAdmin);
        }
    },

    User: {
        resident(obj, args, {residentConnector}) {
            if (obj.resident_id) {
                return residentConnector.getOne(obj.resident_id);
            }
            return null;
        },

        superAdmin(obj) {
            return obj.super_admin === '1';
        }
    }
};