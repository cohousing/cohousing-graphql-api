import {AuditConnector} from './connector';

export {Schema, Resolver} from './schema';

export function Context(request) {
    return {
        auditConnector: new AuditConnector(request)
    }
}

/**
 * Remove unchanged properties
 *
 * @param change The change to clean up
 */
function cleanUpChange(change) {
    let cleanChange = {};
    Object.keys(change).forEach(prop => {
        if (change[prop].o !== change[prop].n) {
            cleanChange[prop] = change[prop];
        }
    });
    return cleanChange;
}

export const OPERATION_CREATE = 'create';
export const OPERATION_UPDATE = 'update';
export const OPERATION_DELETE = 'delete';

export function createAudit(db, user, type, objectId, operation, change) {
    change = cleanUpChange(change);

    if (Object.keys(change).length > 0) {
        return db('audit').insert({
            type: type,
            "user_id": user.id,
            "object_id": objectId,
            operation: operation,
            change: JSON.stringify(change)
        }).then((results) => {
            if (results.length !== 1) {
                throw new Error('Couldn\'t insert audit');
            }
        });
    } else {
        return false;
    }
}