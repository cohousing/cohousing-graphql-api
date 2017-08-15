exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('residents', (table) => {
            table.increments();
            table.timestamps();
            table.string('name');
            table.integer('home_id').unsigned();
            table.foreign('home_id').references('homes.id');
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('residents')
    ]);
};
