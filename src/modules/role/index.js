import {RoleConnector} from './connector';

export {Schema, Resolver} from './schema';

export function Context(request) {
    return {
        roleConnector: new RoleConnector(request)
    }
}
