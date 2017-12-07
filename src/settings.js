export const settings = {
    tenantDomain: '{tenantContext}.cohousing.nu',

    db: {
        host: '127.0.0.1',
        user: 'root',
        password: ''
    },

    auth: {
        publicKeyPath: __dirname + '/../public.pem',
        privateKeyPath: __dirname + '/../private.pem',
        privateKeyPassphrase: 'test1234'
    },

    development: {
        // Development property, to create test data on every start of the server.
        seedOnStart: false,

        debugSql: false
    },

    // TODO These should come from dynamically configured endpoints
    tenants: [{
        context: 'tenant1',
        name: 'Tenant 1',
        customDomain: 'localhost'
    }, {
        context: 'tenant2',
        name: 'Tenant 2'
    }, {
        context: 'tenant3',
        name: 'Tenant 3'
    }]
};