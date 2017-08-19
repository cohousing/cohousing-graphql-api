exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('residents', (table) => {
            table.increments();
            table.timestamps();
            table.string('name').notNullable();
            table.string('username', 100);
            table.string('password', 128);
            table.string('salt', 64);

            table.integer('home_id').unsigned();
            table.foreign('home_id').references('homes.id');

            table.unique('username', 'idx_username');
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('residents')
    ]);
};
