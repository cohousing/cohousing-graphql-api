import {UserConnector} from './connector';

export {Schema, Resolver} from './schema';

export function Context(request) {
    return {
        userConnector: new UserConnector(request)
    }
}
