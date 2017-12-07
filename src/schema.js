import fs from 'fs';
import {makeExecutableSchema} from 'graphql-tools';
import {merge} from 'lodash';

import {RootResolvers} from './resolvers';
import {ModuleSchemas, ModuleResolvers} from './modules';

const rootSchema = fs.readFileSync(__dirname + '/root-schema.graphqls', 'UTF-8');

export const schema = makeExecutableSchema({
    typeDefs: [
        rootSchema,
        ModuleSchemas
    ],
    resolvers: merge(
        RootResolvers,
        ModuleResolvers
    )
});