exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('homes', (table) => {
            table.increments();
            table.string('name').notNullable();
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('homes')
    ]);
};
