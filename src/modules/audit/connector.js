import DataLoader from 'dataloader';
import sort from 'dataloader-sort';

import {BaseConnector} from '../baseconnector';

export class AuditConnector extends BaseConnector {
    constructor(request) {
        super(request);
        this.db = request.tenant.db;

        this.loader = new DataLoader(ids => {
            return this.db('audit')
                .whereIn('id', ids)
                .then(data => {
                    return sort(ids, data);
                });
        });
    }

    getAllAudits() {
        return this.authz('audit:read').then(() => {
            return this.db('audit').then(data => {
                return data;
            });
        });
    }

    auditsFor(objectType, objectId) {
        return this.authz('audit:read').then(() => {
            return this.db('audit')
                .where('type', objectType)
                .where('object_id', objectId)
                .then(data => {
                    return data;
                });
        });
    }
}
