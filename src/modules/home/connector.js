import DataLoader from 'dataloader';
import sort from 'dataloader-sort';
import {values} from 'lodash';

import {BaseConnector} from '../baseconnector';
import {createAudit, OPERATION_CREATE, OPERATION_UPDATE} from '../audit';

export class HomeConnector extends BaseConnector {
    constructor(request) {
        super(request);
        this.db = request.tenant.db;

        this.loader = new DataLoader(ids => {
            return this.db('homes')
                .leftOuterJoin('residents', 'homes.id', '=', 'residents.home_id')
                .select('homes.*', 'residents.id as resident_id')
                .whereIn('homes.id', ids)
                .then(data => {
                    return sort(ids, HomeConnector._flattenResult(data));
                });
        });
    }

    static _flattenResult(data) {
        return values(data.reduce((flat, val) => {
            let elm = flat[val.id];
            if (!elm) {
                elm = val;
                elm.residents = [];
                flat[val.id] = elm;
            }
            if (val.resident_id) {
                elm.residents.push(val.resident_id);
                delete val.resident_id;
            }
            return flat;
        }, {}));
    }

    getAllHomes() {
        return this.authz('home:read').then(() => {
            return this.db('homes')
                .leftOuterJoin('residents', 'homes.id', '=', 'residents.home_id')
                .select('homes.*', 'residents.id as resident_id').then(data => {
                    return HomeConnector._flattenResult(data);
                });
        });
    }

    getHome(id) {
        return this.authz('home:read').then(() => {
            return this.loader.load(id);
        });
    }

    getHomes(ids) {
        return this.authz('home:read').then(() => {
            return this.loader.loadMany(ids);
        });
    }

    createHome(name) {
        let self = this;
        return self.authz('home:create').then(() => {
            return self.db('homes').insert({
                name: name
            }).then(function (id) {
                createAudit(self.db, self.loggedInUser, 'home', id, OPERATION_CREATE, {
                    name: {
                        o: null,
                        n: name
                    }
                });
                return self.loader.load(id[0]);
            });
        });
    }

    updateHome(id, name) {
        let self = this;
        return self.authz('home:update').then(() => {
            return self.db('homes')
                .select('name')
                .where('id', id).then((results) => {
                    if (results.length !== 1) {
                        throw new Error('No entry found with id ' + id);
                    }

                    let oldName = results[0].name;

                    return self.db('homes')
                        .where('id', id)
                        .update({
                            name: name
                        }).then(() => {
                            createAudit(self.db, self.loggedInUser, 'home', id, OPERATION_UPDATE, {
                                name: {
                                    o: oldName,
                                    n: name
                                }
                            });
                            return self.loader.load(id);
                        });
                });

        });
    }
}
