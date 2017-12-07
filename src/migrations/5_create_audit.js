exports.up = function (knex, Promise) {
    return Promise.all([
        knex.schema.createTable('audit', (table) => {
            table.increments();
            table.timestamp('audit_date').notNullable();
            table.integer('user_id').unsigned().notNullable();
            table.string('type').notNullable();
            table.integer('object_id').unsigned().notNullable();
            table.string('operation').notNullable();
            table.text('change', 'mediumtext');

            table.foreign('user_id').references('users.id');
        })
    ]);
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('audit')
    ]);
};
