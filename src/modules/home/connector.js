import DataLoader from 'dataloader';
import sort from 'dataloader-sort';
import {values} from 'lodash';

import {BaseConnector} from '../baseconnector';

export class HomeConnector extends BaseConnector {
    constructor(request) {
        super(request);
        this.db = request.tenant.db;

        this.loader = new DataLoader(ids => {
            return this.db('homes')
                .join('residents', 'homes.id', '=', 'residents.home_id')
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
        return this.authz('home:read', () => {
            return this.db('homes')
                .join('residents', 'homes.id', '=', 'residents.home_id')
                .select('homes.*', 'residents.id as resident_id').then(data => {
                    return HomeConnector._flattenResult(data);
                });
        }, []);
    }

    getHome(id) {
        return this.authz('home:read', () => {
            return this.loader.load(id);
        });
    }

    getHomes(ids) {
        return this.authz('home:read', () => {
            return this.loader.loadMany(ids);
        });
    }
}
