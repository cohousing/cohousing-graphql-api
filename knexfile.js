// Update with your config settings.

module.exports = {

    development: {
        client: 'mariasql',
        debug: true,
        connection: {
            host: '127.0.0.1',
            user: 'root',
            password: '',
            db: 'tenant1'
        },
        migrations: {
            tableName: 'KNEX_MIGRATIONS',
            directory: 'src/migrations'
        }
    }

};
