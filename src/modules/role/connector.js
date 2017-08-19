import {BaseConnector} from '../baseconnector';

export class RoleConnector extends BaseConnector {
    constructor(request) {
        super(request);
        this.db = request.tenant.db;
    }

    getAllRoles() {
        return this.authz('role:read', () => {
            return this.db.select().from('roles');
        }, []);
    }
}