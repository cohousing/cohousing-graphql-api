import {merge} from 'lodash';

import {Schema as HomeSchema, Context as HomeContext, Resolver as HomeResolver} from './home';
import {Schema as ResidentSchema, Context as ResidentContext, Resolver as ResidentResolver} from './resident';
import {Schema as RoleSchema, Context as RoleContext, Resolver as RoleResolver} from './role';
import {Schema as UserSchema, Context as UserContext, Resolver as UserResolver} from './user';

export function ModuleContexts(request) {
    return merge(
        HomeContext(request),
        ResidentContext(request),
        RoleContext(request),
        UserContext(request),
    );
}

export function ModuleSchemas() {
    return [
        HomeSchema,
        ResidentSchema,
        RoleSchema,
        UserSchema,
    ]
}

export const ModuleResolvers = merge(
    HomeResolver,
    ResidentResolver,
    RoleResolver,
    UserResolver,
);
