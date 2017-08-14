exports.seed = function (knex) {
    // Deletes ALL existing entries
    return knex('residents').del()
        .then(function () {
            let residents = [];
            for (let i = 1; i <= 100; i++) {
                residents.push({
                    id: i,
                    name: 'Resident '+i,
                    home_id: Math.floor(Math.random() * 50) + 1
                })
            }

            // Inserts seed entries
            return knex('residents').insert(residents);
        });
};
