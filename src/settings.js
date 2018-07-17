export const settings = {
    tenantDomain: '{tenantContext}.cohousing.nu',

    db: {
        host: process.env.COHOUSING_DB_HOST || '127.0.0.1',
        user: process.env.COHOUSING_DB_USER || 'root',
        password: process.env.COHOUSING_DB_PASS || ''
    },

    auth: {
        publicKeyPath: process.env.COHOUSING_PUBLIC_KEY_PATH || __dirname + '/../public.pem',
        privateKeyPath: process.env.COHOUSING_PRIVATE_KEY_PATH || __dirname + '/../private.pem',
        privateKeyPassphrase: process.env.COHOUSING_PRIVATE_KEY_PASSPHRASE || 'test1234'
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