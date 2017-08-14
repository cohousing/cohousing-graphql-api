import {merge} from 'lodash';

import {Schema as HomeSchema, Context as HomeContext, Resolver as HomeResolver} from './home';
import {Schema as ResidentSchema, Context as ResidentContext, Resolver as ResidentResolver} from './resident';

export function ModuleContexts(request) {
    return merge(
        HomeContext(request),
        ResidentContext(request)
    );
}

export function ModuleSchemas() {
    return [
        HomeSchema,
        ResidentSchema
    ]
}

export const ModuleResolvers = merge(
    HomeResolver,
    ResidentResolver
);
