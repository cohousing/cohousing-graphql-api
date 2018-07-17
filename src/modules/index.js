import fs from 'fs';
import {merge, concat} from 'lodash';

import {Schema as RoleSchema, Context as RoleContext, Resolver as RoleResolver} from './role';
import {Schema as UserSchema, Context as UserContext, Resolver as UserResolver} from './user';
import {Schema as AuditSchema, Context as AuditContext, Resolver as AuditResolver} from './audit';

import {createModule} from './basemodule';

const modules = [
    'home',
    'resident',
];

const moduleDefinitions = modules.map(moduleName => {
    let moduleYaml = fs.readFileSync(__dirname + '/' + moduleName + '/' + moduleName + '.yaml', 'UTF-8');
    return createModule(moduleYaml);
});

export function ModuleContexts(request) {
    let moduleContexts = {};
    moduleDefinitions.forEach(moduleDefinition => {
        moduleContexts = merge(moduleContexts, moduleDefinition.createContext(request));
    });

    return merge(
        RoleContext(request),
        UserContext(request),
        AuditContext(request),
        moduleContexts,
    );
}

export function ModuleSchemas() {
    return concat([
        RoleSchema,
        UserSchema,
        AuditSchema,
    ], moduleDefinitions.map(moduleDefinition => {
        return moduleDefinition.getSchema();
    }));
}

let moduleResolvers = {};
moduleDefinitions.forEach(moduleDefinition => {
    moduleResolvers = merge(moduleResolvers, moduleDefinition.getResolver());
});
export const ModuleResolvers = merge(
    RoleResolver,
    UserResolver,
    AuditResolver,
    moduleResolvers,
);
