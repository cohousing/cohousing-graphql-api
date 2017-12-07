import DataLoader from 'dataloader';
import sort from 'dataloader-sort';
import crypto from 'crypto';

import {BaseConnector} from '../baseconnector';
import {createAudit, OPERATION_CREATE, OPERATION_UPDATE} from "../audit";

export class ResidentConnector extends BaseConnector {
    constructor(request) {
        super(request);
        this.db = request.tenant.db;

        this.loader = new DataLoader(ids => {
            return this.db('residents')
                .whereIn('id', ids)
                .then(data => {
                    return sort(ids, data);
                });
        });
    }

    getAllResidents() {
        return this.authz('resident:read').then(() => {
            return this.db.select().from('residents');
        });
    }

    getResident(id) {
        return this.authz('resident:read').then(() => {
            return this.loader.load(id);
        });
    }

    getResidents(ids) {
        return this.authz('resident:read').then(() => {
            return this.loader.loadMany(ids);
        });
    }

    getLoggedInUser() {
        return this.loggedInUser;
    }

    createResident(name, homeId) {
        let self = this;
        return self.authz('resident:create').then(() => {
            return self.db('residents').insert({
                name,
                home_id: homeId
            }).then(function (id) {
                createAudit(self.db, self.loggedInUser, 'resident', id, OPERATION_CREATE, {
                    name: {
                        o: null,
                        n: name
                    },
                    homeId: {
                        o: null,
                        n: homeId
                    }
                });
                return self.loader.load(id[0]);
            });
        });
    }

    updateResident(id, name, homeId) {
        let self = this;
        return self.authz('resident:update').then(() => {
            return self.db('residents')
                .select('name', 'home_id')
                .where('id', id).then((results) => {
                    if (results.length !== 1) {
                        throw new Error('No entry found with id ' + id);
                    }

                    let oldName = results[0].name;
                    let oldHomeId = results[0].home_id;

                    return self.db('residents')
                        .where('id', id)
                        .update({
                            name: name,
                            home_id: homeId
                        }).then(() => {
                            createAudit(self.db, self.loggedInUser, 'resident', id, OPERATION_UPDATE, {
                                name: {
                                    o: oldName,
                                    n: name
                                },
                                homeId: {
                                    o: oldHomeId,
                                    n: homeId
                                }
                            });
                            return self.loader.load(id);
                        });
                });

        });
    }
}