import express from 'express';
import bodyParser from 'body-parser';
import {graphiqlExpress, graphqlExpress} from 'apollo-server-express';

import {settings} from './settings';
import {tenant, TenantConfig} from './tenant';
import {schema} from './schema';
import {context} from './context';

const PORT = 3000;

let tenantConfig = new TenantConfig(settings);

let app = express();

app.use(tenant(tenantConfig));

app.use('/graphql', bodyParser.json(), graphqlExpress(request => ({
    schema: schema,
    context: context(request)
})));

app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql'
}));

app.listen(PORT);

console.log('App server started on port: ' + PORT);
