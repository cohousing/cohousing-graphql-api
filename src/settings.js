export const settings = {
    tenantDomain: '{tenantContext}.cohousing.nu',

    db: {
        host: '127.0.0.1',
        user: 'root',
        password: ''
    },

    development: {
        // Development property, to create test data on every start of the server.
        seedOnStart: true,

        debugSql: false
    },

    // TODO These should come from dynamically configured endpoints
    tenants: [{
        context: 'tenant1',
        name: 'Tenant 1'
    }, {
        context: 'tenant2',
        name: 'Tenant 2'
    }, {
        context: 'tenant3',
        name: 'Tenant 3'
    }]
};