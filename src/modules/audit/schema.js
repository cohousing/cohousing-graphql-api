import fs from 'fs';
import _ from 'lodash';

import {Schema as UserSchema} from '../user';
import {Schema as HomeSchema} from '../home';
import {Schema as ResidentSchema} from '../resident';
import {Schema as RoleSchema} from '../role';

const AuditSchema = fs.readFileSync(__dirname + '/audit.graphqls', 'UTF-8');

export function Schema() {
    return [AuditSchema, UserSchema, HomeSchema, ResidentSchema, RoleSchema];
}

const Audit = {
    __resolveType(obj) {
        switch (obj.type) {
            case 'home':
                return 'HomeAudit';
            case 'resident':
                return 'ResidentAudit';
            case 'role':
                return 'RoleAudit';
            case 'user':
                return 'UserAudit';
            default:
                return 'DefaultAudit';
        }
    },

    auditDate(obj) {
        return obj.audit_date;
    },

    auditUser(obj, args, {userConnector}) {
        return userConnector.getUser(obj.user_id);
    },

    objectType(obj) {
        return obj.type;
    },

    objectId(obj) {
        return obj.object_id;
    },

    operation(obj) {
        return obj.operation.toUpperCase();
    }
};

const HomeAudit = _.extend({}, Audit, {
    home(obj, args, {homeConnector}) {
        return homeConnector.getHome(obj.object_id);
    }
});

const ResidentAudit = _.extend({}, Audit, {
    resident(obj, args, {residentConnector}) {
        return residentConnector.getResident(obj.object_id);
    }
});

const RoleAudit = _.extend({}, Audit, {
    role(obj, args, {roleConnector}) {
        return roleConnector.getRole(obj.object_id);
    }
});

const UserAudit = _.extend({}, Audit, {
    user(obj, args, {userConnector}) {
        return userConnector.getUser(obj.object_id);
    }
});

export const Resolver = {
    Query: {
        allAudits(obj, args, {auditConnector}) {
            return auditConnector.getAllAudits();
        },

        auditsFor(obj, args, {auditConnector}) {
            return auditConnector.auditsFor(args.objectType, args.objectId);
        }
    },

    Audit: Audit,

    // Implementation properties

    HomeAudit: HomeAudit,

    ResidentAudit: ResidentAudit,

    RoleAudit: RoleAudit,

    UserAudit: UserAudit,

    DefaultAudit: Audit
};