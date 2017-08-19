exports.up = function (knex, Promise) {
    return Promise.all([
        knex.schema.createTable('roles', (table) => {
            table.increments();
            table.timestamps();
            table.string('name').notNullable();

            table.string('home', 4).notNullable().defaultTo('0000');
            table.string('resident', 4).notNullable().defaultTo('0000');
            table.string('role', 4).notNullable().defaultTo('0000');
        }),

        knex.schema.createTable('residents_roles', (table) => {
            table.integer('resident_id').unsigned();
            table.integer('role_id').unsigned();
            table.primary(['resident_id', 'role_id']);

            table.foreign('resident_id').references('residents.id');
            table.foreign('role_id').references('roles.id');
        })
    ]);
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('residents_roles'),
        knex.schema.dropTable('roles')
    ]);
};
