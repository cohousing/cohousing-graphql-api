import {ResidentConnector} from './connector';

export {Schema, Resolver} from './schema';

export function Context() {
    return {
        residentConnector: new ResidentConnector()
    }
}
