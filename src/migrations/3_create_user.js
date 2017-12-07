exports.up = function (knex, Promise) {
    return Promise.all([
        knex.schema.createTable('users', (table) => {
            table.increments();
            table.string('username', 100).notNullable();
            table.string('password', 128).notNullable();
            table.string('salt', 64).notNullable();
            table.integer('resident_id').unsigned();
            table.boolean('super_admin').notNullable().defaultTo(false);

            table.unique('username', 'idx_username');
            table.foreign('resident_id').references('residents.id');
        })
    ]);
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('users')
    ]);
};
