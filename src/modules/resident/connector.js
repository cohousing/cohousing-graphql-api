import DataLoader from 'dataloader';

import {BaseConnector} from '../baseconnector';

export class ResidentConnector extends BaseConnector {
    constructor(request) {
        super(request);
        this.db = request.tenant.db;

        this.loader = new DataLoader(ids => new Promise(resolve => {
            this.db.select().from('residents').whereIn('id', ids).then(resolve);
        }));
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