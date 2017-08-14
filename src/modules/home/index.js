import {HomeConnector} from './connector';

export {Schema, Resolver} from './schema';

export function Context() {
    return {
        homeConnector: new HomeConnector()
    }
}
