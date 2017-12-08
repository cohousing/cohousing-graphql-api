import {merge} from 'lodash';

import {Schema as HomeSchema, Context as HomeContext, Resolver as HomeResolver} from './home';
import {Schema as ResidentSchema, Context as ResidentContext, Resolver as ResidentResolver} from './resident';
import {Schema as RoleSchema, Context as RoleContext, Resolver as RoleResolver} from './role';
import {Schema as UserSchema, Context as UserContext, Resolver as UserResolver} from './user';
import {Schema as AuditSchema, Context as AuditContext, Resolver as AuditResolver} from './audit';

export function ModuleContexts(request) {
    return merge(
        HomeContext(request),
        ResidentContext(request),
        RoleContext(request),
        UserContext(request),
        AuditContext(request),
    );
}

export function ModuleSchemas() {
    return [
        HomeSchema,
        ResidentSchema,
        RoleSchema,
        UserSchema,
        AuditSchema,
    ]
}

export const ModuleResolvers = merge(
    HomeResolver,
    ResidentResolver,
    RoleResolver,
    UserResolver,
    AuditResolver,
);
