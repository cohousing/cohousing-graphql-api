import express from 'express';
import {json, urlencoded} from 'body-parser';
import {graphqlExpress} from 'apollo-server-express';
import {formatError} from 'apollo-errors';
import PlaygroundMiddleware from 'graphql-playground-middleware-express';

import {settings} from './settings';
import {tenant, TenantConfig} from './tenant';
import {auth, login} from './auth';
import {schema} from './schema';
import {context} from './context';

const PORT = 3000;

let tenantConfig = new TenantConfig(settings);

let app = express();

app.use(tenant(tenantConfig));

app.post('/login', json(), login(settings));

app.use('/graphql', auth(settings), json(), graphqlExpress(request => ({
    formatError,
    schema: schema,
    context: context(request)
})));

app.use('/playground', PlaygroundMiddleware({
    endpoint: '/graphql'
}));

app.listen(PORT);

console.log('App server started on port: ' + PORT);
