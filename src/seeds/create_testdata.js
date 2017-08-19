import crypto from 'crypto';

exports.seed = function (knex) {
    // Deletes ALL existing entries
    return knex('residents_roles').del().then(() => {
        return knex('roles').del();
    }).then(() => {
        return knex('residents').del();
    }).then(() => {
        return knex('homes').del();
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
            let salt = crypto.randomBytes(32).toString('hex');
            let generatedPassword = crypto.pbkdf2Sync('resident' + i, salt, 10000, 64, 'sha512').toString('hex');
            residents.push({
                id: i,
                name: 'Resident ' + i,
                username: 'resident' + i,
                password: generatedPassword,
                salt: salt,
                home_id: Math.floor(Math.random() * 50) + 1
            });
        }

        // Inserts seed entries
        return knex('residents').insert(residents);
    }).then(() => {
        let roles = [];

        roles.push({
            id: 1,
            name: 'Admin',
            home: '1111',
            resident: '1111',
            role: '1111'
        });

        roles.push({
            id: 2,
            name: 'User',
            home: '0100',
            resident: '0100',
            role: '0000'
        });

        roles.push({
            id: 3,
            name: 'Moderator',
            home: '1110',
            resident: '1110',
            role: '0100'
        });

        return knex('roles').insert(roles);
    }).then(() => {
        let residentsRoles = [];

        for (let i = 1; i <= 5; i++) {
            residentsRoles.push({
                resident_id: i,
                role_id: 1
            });
        }

        for (let i = 6; i <= 10; i++) {
            residentsRoles.push({
                resident_id: i,
                role_id: 2
            });
            residentsRoles.push({
                resident_id: i,
                role_id: 3
            });
        }

        for (let i = 11; i <= 95; i++) {
            residentsRoles.push({
                resident_id: i,
                role_id: 2
            });
        }

        return knex('residents_roles').insert(residentsRoles);
    });
};
