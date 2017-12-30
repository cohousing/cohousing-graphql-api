import fs from 'fs';
import {makeExecutableSchema} from 'graphql-tools';
import {merge} from 'lodash';

import {ModuleSchemas, ModuleResolvers} from './modules';
import {ScalarSchemas, ScalarResolvers} from './scalars';

const rootSchema = fs.readFileSync(__dirname + '/root-schema.graphqls', 'UTF-8');

const RootResolvers = {
    Query: {
        info(obj, args, {tenant}) {
            return {
                name: tenant.name
            }
        }
    }
};

export const schema = makeExecutableSchema({
    typeDefs: [
        rootSchema,
        ModuleSchemas,
        ScalarSchemas
    ],
    resolvers: merge(
        RootResolvers,
        ModuleResolvers,
        ScalarResolvers
    )
});