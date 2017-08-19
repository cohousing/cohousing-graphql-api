import DataLoader from 'dataloader';
import sort from 'dataloader-sort';

import {BaseConnector} from '../baseconnector';

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
        return this.authz('resident:read', () => {
            return this.db.select().from('residents');
        });
    }

    getResident(id) {
        return this.authz('resident:read', () => {
            return this.loader.load(id);
        });
    }

    getResidents(ids) {
        return this.authz('resident:read', () => {
            return this.loader.loadMany(ids);
        });
    }
}