exports.seed = function (knex) {
    // Deletes ALL existing entries
    return knex('homes').del()
        .then(function () {
            // Inserts seed entries
            let homes = [];
            for (let i = 1; i <= 50; i++) {
                homes.push({
                    id: i,
                    name: 'Home '+i
                })
            }

            return knex('homes').insert(homes);
        });
};
