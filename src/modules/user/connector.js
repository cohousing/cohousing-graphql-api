import DataLoader from 'dataloader';
import sort from 'dataloader-sort';

import {BaseConnector} from '../baseconnector';

export class UserConnector extends BaseConnector {
    constructor(request) {
        super(request);
        this.db = request.tenant.db;

        this.loader = new DataLoader(ids => {
            return this.db('users')
                .whereIn('id', ids)
                .then(data => {
                    return sort(ids, data);
                });
        });
    }

    getAllUsers() {
        return this.authz('user:read').then(() => {
            return this.db('users').then(data => {
                return data;
            });
        });
    }

    getUser(id) {
        return this.authz('user:read').then(() => {
            return this.loader.load(id);
        });
    }

    getUsers(ids) {
        return this.authz('user:read').then(() => {
            return this.loader.loadMany(ids);
        });
    }
}
