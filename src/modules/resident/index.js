import {ResidentConnector} from './connector';

export {Schema, Resolver} from './schema';

export function Context(request) {
    return {
        residentConnector: new ResidentConnector(request)
    }
}
