exports.up = function (knex, Promise) {
    return Promise.all([
        knex.schema.createTable('roles', (table) => {
            table.increments();
            table.string('name').notNullable();

            table.text('permissions', 'text').notNullable();
        }),

        knex.schema.createTable('users_roles', (table) => {
            table.integer('user_id').unsigned();
            table.integer('role_id').unsigned();
            table.primary(['user_id', 'role_id']);

            table.foreign('user_id').references('users.id');
            table.foreign('role_id').references('roles.id');
        })
    ]);
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('users_roles'),
        knex.schema.dropTable('roles')
    ]);
};
