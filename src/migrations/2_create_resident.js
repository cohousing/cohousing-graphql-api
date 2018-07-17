exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('residents', (table) => {
            table.increments();
            table.string('name').notNullable();

            table.integer('homeId').unsigned();
            table.foreign('homeId').references('homes.id');
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('residents')
    ]);
};
