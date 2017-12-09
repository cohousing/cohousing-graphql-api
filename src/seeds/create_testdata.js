import crypto from 'crypto';
import async from 'async';

import {HomeConnector} from '../modules/home/connector';
import {ResidentConnector} from '../modules/resident/connector';
import {RoleConnector} from '../modules/role/connector';
import {UserConnector} from '../modules/user/connector';

exports.seed = function (knex) {
    let request = {
        tenant: {
            db: knex
        },
        user: {
            sa: true
        }
    };

    let homeConnector;
    let residentConnector;
    let roleConnector;
    let userConnector;

    let roles;

    // Deletes ALL existing entries
    return knex('users_roles').del().then(() => {
        return knex('roles').del();
    }).then(() => {
        return knex('audit').del();
    }).then(() => {
        return knex('users').del();
    }).then(() => {
        return knex('residents').del();
    }).then(() => {
        return knex('homes').del();
    }).then(() => {
        // Create super admin user
        let salt = crypto.randomBytes(32).toString('hex');
        let generatedPassword = crypto.pbkdf2Sync('admin', salt, 10000, 64, 'sha512').toString('hex');
        let superAdminUser = {
            username: 'admin',
            password: generatedPassword,
            salt: salt,
            super_admin: true
        };
        request.loggedInUser = superAdminUser;
        homeConnector = new HomeConnector(request);
        residentConnector = new ResidentConnector(request);
        roleConnector = new RoleConnector(request);
        userConnector = new UserConnector(request);
        return knex('users').insert(superAdminUser);
    }).then((adminId) => {
        request.loggedInUser.id = adminId[0];
        return true;
    }).then(() => {
        return new Promise((resolve, reject) => {
            async.series([
                step => {
                    roleConnector.createRole({
                        name: 'Admin',
                        permissions: [{
                            objectType: 'home',
                            create: true,
                            read: true,
                            update: true,
                            delete: true
                        }, {
                            objectType: 'resident',
                            create: true,
                            read: true,
                            update: true,
                            delete: true
                        }, {
                            objectType: 'role',
                            create: true,
                            read: true,
                            update: true,
                            delete: true
                        }]
                    }).then(role => {
                        step(null, role);
                    });
                },
                step => {
                    roleConnector.createRole({
                        name: 'User',
                        permissions: [{
                            objectType: 'home',
                            create: false,
                            read: true,
                            update: false,
                            delete: false
                        }, {
                            objectType: 'resident',
                            create: false,
                            read: true,
                            update: false,
                            delete: false
                        }, {
                            objectType: 'role',
                            create: false,
                            read: false,
                            update: false,
                            delete: false
                        }]
                    }).then(role => {
                        step(null, role);
                    });
                },
                step => {
                    roleConnector.createRole({
                        name: 'Moderator',
                        permissions: [{
                            objectType: 'home',
                            create: true,
                            read: true,
                            update: true,
                            delete: false
                        }, {
                            objectType: 'resident',
                            create: true,
                            read: true,
                            update: true,
                            delete: false
                        }, {
                            objectType: 'role',
                            create: false,
                            read: true,
                            update: false,
                            delete: false
                        }]
                    }).then(role => {
                        step(null, role);
                    });
                }
            ], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    roles = result;
                    resolve();
                }
            });
        });
    }).then(() => {
        // Inserts seed entries
        let homes = [];
        for (let i = 1; i <= 50; i++) {
            homes.push(homeConnector.createHome('Home ' + i));
        }

        return Promise.all(homes);
    }).then((homes) => {
        let residents = [];
        for (let i = 1; i <= 100; i++) {
            residents.push(residentConnector.createResident('Resident ' + i, homes[Math.floor(Math.random() * 50)].id));
        }
        // Inserts seed entries
        return Promise.all(residents);
    }).then((residents) => {
        let users = [];

        residents.forEach(resident => {
            let username = resident.name.replace(' ', '').toLowerCase();
            users.push(userConnector.createUser(username, username, resident.id, false));
        });

        return Promise.all(users);
    }).then((users) => {
        let usersRoles = [];

        usersRoles.push(roleConnector.connectRolesAndUsers([roles[0].id], users.slice(0, 5).map(user => user.id)));
        usersRoles.push(roleConnector.connectRolesAndUsers([roles[1].id, roles[2].id], users.slice(5, 10).map(user => user.id)));
        usersRoles.push(roleConnector.connectRolesAndUsers([roles[2].id], users.slice(10, 95).map(user => user.id)));

        return Promise.all(usersRoles);
    }).then(() => {
        console.log('DONE')
    }, (error) => {
        console.error(error);
    });
};
