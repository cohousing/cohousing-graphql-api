import fs from 'fs';
import _ from 'lodash';

const AuditSchema = fs.readFileSync(__dirname + '/audit.graphqls', 'UTF-8');

export function Schema() {
    return [AuditSchema];
}

export const Resolver = {
    Query: {
        allAudits(obj, args, {auditConnector}) {
            return auditConnector.getAllAudits();
        },

        auditsFor(obj, args, {auditConnector}) {
            return auditConnector.auditsFor(args.objectType, args.objectId);
        }
    },

    Audit: {
        auditUser(obj, args, {userConnector}) {
            return userConnector.getUser(obj.user_id);
        },
    }
};