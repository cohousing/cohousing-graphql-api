exports.seed = function (knex) {
    // Deletes ALL existing entries
    return knex('residents').del().then(() => {
        return knex('homes').del().then(() => {

        });
    }).then(() => {
        // Inserts seed entries
        let homes = [];
        for (let i = 1; i <= 50; i++) {
            homes.push({
                id: i,
                name: 'Home ' + i
            })
        }

        return knex('homes').insert(homes);
    }).then(() => {
        let residents = [];
        for (let i = 1; i <= 100; i++) {
            residents.push({
                id: i,
                name: 'Resident ' + i,
                home_id: Math.floor(Math.random() * 50) + 1
            })
        }

        // Inserts seed entries
        return knex('residents').insert(residents);
    });
};
