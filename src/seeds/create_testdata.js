import crypto from 'crypto';
import async from 'async';

import {HomeConnector} from '../modules/home/connector';
import {ResidentConnector} from '../modules/resident/connector';
import {RoleConnector} from '../modules/role/connector';
import {UserConnector} from '../modules/user/connector';

class TestDataLoader {
    constructor(knex) {
        this.knex = knex;

        this.request = {
            tenant: {
                db: knex
            },
            user: {
                sa: true
            }
        };

        this.homeConnector = null;
        this.residentConnector = null;
        this.roleConnector = null;
        this.userConnector = null;

        this.data = {};
    }

    execute() {
        return this.deleteTables(this.knex)
            .then(this.createSuperAdminUser(this.knex))
            .then(this.createRoles(this.knex))
            .then(this.createHomes(this.knex))
            .then(this.createResidents(this.knex))
            .then(this.createUsers(this.knex))
            .then(this.associateUsersWithRoles(this.knex))
            .then(() => {
                console.log('DONE FOR', this.knex.client.connectionSettings.db);
            }, (error) => {
                console.error(error, 'FOR', this.knex.client.connectionSettings.db);
            });
    }

    deleteTables(knex) {
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
        })
    }

    createSuperAdminUser(knex) {
        let self = this;
        return () => {
            // Create super admin user
            let salt = crypto.randomBytes(32).toString('hex');
            let generatedPassword = crypto.pbkdf2Sync('admin', salt, 10000, 64, 'sha512').toString('hex');
            let superAdminUser = {
                username: 'admin',
                password: generatedPassword,
                salt: salt,
                super_admin: true
            };
            self.request.loggedInUser = superAdminUser;
            self.homeConnector = new HomeConnector(self.request);
            self.residentConnector = new ResidentConnector(self.request);
            self.roleConnector = new RoleConnector(self.request);
            self.userConnector = new UserConnector(self.request);
            return knex('users').insert(superAdminUser)
                .then(adminIds => {
                    self.request.loggedInUser.id = adminIds[0];
                    return true;
                });
        };
    }

    createRoles(knex) {
        let self = this;
        return () => {
            return new Promise((resolve, reject) => {
                async.series([
                    self.createAdminRole(),
                    self.createUserRole(),
                    self.createModeratorRole()
                ], (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        self.data.roles = result;
                        resolve();
                    }
                });
            });
        };
    }

    createAdminRole() {
        return this.createRole('Admin', [
            TestDataLoader.addPermission('home', true, true, true, true),
            TestDataLoader.addPermission('resident', true, true, true, true),
            TestDataLoader.addPermission('role', true, true, true, true),
            TestDataLoader.addPermission('user', true, true, true, true)
        ]);
    }

    createUserRole() {
        return this.createRole('User', [
            TestDataLoader.addPermission('home', false, true, false, false),
            TestDataLoader.addPermission('resident', false, true, false, false),
            TestDataLoader.addPermission('role', false, false, false, false),
            TestDataLoader.addPermission('user', false, false, false, false)
        ]);
    }

    createModeratorRole() {
        return this.createRole('Moderator', [
            TestDataLoader.addPermission('home', true, true, true, false),
            TestDataLoader.addPermission('resident', true, true, true, false),
            TestDataLoader.addPermission('role', false, true, false, false),
            TestDataLoader.addPermission('user', false, true, false, false)
        ]);
    }

    createRole(name, permissions) {
        let self = this;
        return step => {
            self.roleConnector.createRole({
                name,
                permissions
            }).then(role => {
                step(null, role);
            });
        };
    }

    static addPermission(objectType, create, read, update, del) {
        return {
            objectType,
            create,
            read,
            update,
            delete: del
        }
    }

    createHomes(knex) {
        let self = this;
        return () => {
            let homes = [];
            for (let i = 1; i <= 50; i++) {
                homes.push(self.homeConnector.createHome('Home ' + i));
            }

            return Promise.all(homes).then(homes => {
                self.data.homes = homes;
                return true;
            });
        };
    }

    createResidents(knex) {
        let self = this;
        return () => {
            let residents = [];
            for (let i = 1; i <= 100; i++) {
                residents.push(self.residentConnector.createResident('Resident ' + i, self.data.homes[Math.floor(Math.random() * 50)].id));
            }

            return Promise.all(residents).then(residents => {
                self.data.residents = residents;
                return true;
            });
        };
    }

    createUsers(knex) {
        let self = this;
        return () => {
            let users = [];

            self.data.residents.forEach(resident => {
                let username = resident.name.replace(' ', '').toLowerCase();
                users.push(self.userConnector.createUser(username, username, resident.id, false));
            });


            return Promise.all(users).then(users => {
                self.data.users = users;
                return true;
            });
        };
    }

    associateUsersWithRoles(knex) {
        let self = this;
        return () => {
            let usersRoles = [];

            usersRoles.push(self.roleConnector.connectRolesAndUsers([self.data.roles[0].id], self.data.users.slice(0, 5).map(user => user.id)));
            usersRoles.push(self.roleConnector.connectRolesAndUsers([self.data.roles[1].id, self.data.roles[2].id], self.data.users.slice(5, 10).map(user => user.id)));
            usersRoles.push(self.roleConnector.connectRolesAndUsers([self.data.roles[2].id], self.data.users.slice(10, 95).map(user => user.id)));

            return Promise.all(usersRoles);
        };
    }
}

exports.seed = function (knex) {
    let loader = new TestDataLoader(knex);

    return loader.execute();
};
