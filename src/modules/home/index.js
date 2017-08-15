import {HomeConnector} from './connector';

export {Schema, Resolver} from './schema';

export function Context(request) {
    return {
        homeConnector: new HomeConnector(request)
    }
}
