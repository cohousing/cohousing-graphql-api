import DataLoader from 'dataloader';
import {values} from 'lodash';

export class HomeConnector {
    constructor(request) {
        this.db = request.tenant.db;

        this.loader = new DataLoader(ids => new Promise(resolve => {
            this.db('homes')
                .join('residents', 'homes.id', '=', 'residents.home_id')
                .select('homes.*', 'residents.id as resident_id')
                .whereIn('homes.id', ids)
                .then(data => {
                    resolve(this._flattenResult(data));
                });
        }));
    }

    _flattenResult(data) {
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
        return this.db('homes')
            .join('residents', 'homes.id', '=', 'residents.home_id')
            .select('homes.*', 'residents.id as resident_id').then(data => {
                return this._flattenResult(data);
            });
    }

    getHome(id) {
        return this.loader.load(id);
    }

    getHomes(ids) {
        return this.loader.loadMany(ids);
    }
}