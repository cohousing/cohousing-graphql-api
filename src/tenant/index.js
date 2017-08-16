import knex from 'knex';

export class TenantConfig {
    constructor(settings) {
        this.tenants = {};

        settings.tenants.forEach(tenant => {
            tenant.db = knex({
                client: 'mariasql',
                connection: {
                    host: settings.db.host,
                    user: settings.db.user,
                    password: settings.db.password,
                    db: tenant.context
                },
                debug: settings.development.debugSql,
                migrations: {
                    tableName: 'KNEX_MIGRATIONS',
                    directory: __dirname + '/../migrations'
                },
                seeds: {
                    directory: __dirname + '/../seeds'
                }
            });
            tenant.db.migrate.latest().then(() => {
                console.log(tenant.context, ' has been migrated');

                if (settings.development.seedOnStart) {
                    tenant.db.seed.run();
                }
            });

            this.tenants[settings.tenantDomain.replace('{tenantContext}', tenant.context)] = tenant;
        });
    }

    getTenant(hostname) {
        return this.tenants[hostname];
    }
}

export function tenant(tenantConfig) {
    return function tenantMiddleware(req, res, next) {
        let foundTenant = tenantConfig.getTenant(req.hostname);
        if (foundTenant) {
            req.tenant = foundTenant;
            next();
        } else {
            next(new Error('No tenant found for hostname: ' + req.hostname));
        }
    }
}