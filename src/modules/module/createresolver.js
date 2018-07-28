import {capitalize} from "lodash";

function serializeIdInDataObject(modelKey, dataObject) {
    dataObject.id = serializeId(modelKey, dataObject.id);
}

function serializeIdInData(modelKey, data) {
    if (data.constructor === Array) {
        data.forEach(row => {
            serializeIdInDataObject(modelKey, row);
        });
    } else {
        serializeIdInDataObject(modelKey, data);
    }
    return data;
}

function serializeId(modelKey, id) {
    if (typeof(id) === 'number') {
        return Buffer.from(modelKey + ':' + id).toString('base64')
    } else {
        return id;
    }

}

function deserializeId(serializedId) {
    return Buffer.from(serializedId, 'base64').toString('ascii').split(':')[1];
}

function isModelContainingRelations(modelDoc) {
    let contains = false;
    Object.keys(modelDoc.fields).forEach(fieldKey => {
        let fieldDoc = modelDoc.fields[fieldKey];
        if (fieldDoc.relation) {
            contains = true;
        }
    });
    return contains;
}

export function createResolver(moduleDoc) {
    let resolver = {
        Query: {},
        Mutation: {}
    };

    Object.keys(moduleDoc.models).forEach(modelKey => {
        let modelDoc = moduleDoc.models[modelKey];
        let connectorKey = modelKey + 'Connector';

        let plural = modelDoc.plural ? modelDoc.plural : modelKey + 's';

        resolver.Query[modelKey] = (obj, args, context) => {
            let connector = context[connectorKey];
            return connector.getOne(deserializeId(args.id)).then(data => {
                return serializeIdInData(modelKey, data);
            });
        };

        resolver.Query[plural] = (obj, args, context) => {
            let connector = context[connectorKey];
            return connector.getAll().then(data => {
                return serializeIdInData(modelKey, data);
            });
        };

        resolver.Mutation['create' + capitalize(modelKey)] = (obj, args, context) => {
            let connector = context[connectorKey];
            let input = args[modelKey];

            Object.keys(input).forEach(fieldKey => {
                if (fieldKey.endsWith('Id')) {
                    let relationFieldKey = fieldKey.substr(0, fieldKey.length - 2);
                    let fieldDoc = modelDoc.fields[relationFieldKey];
                    if (fieldDoc && fieldDoc.relation && fieldDoc.relation.type === 'many-to-one') {
                        input[fieldKey] = deserializeId(input[fieldKey]);
                    }
                }
            });

            return connector.create(input).then(data => {
                return serializeIdInData(modelKey, data);
            });
        };

        resolver.Mutation['update' + capitalize(modelKey)] = (obj, args, context) => {
            let connector = context[connectorKey];
            let input = args[modelKey];

            Object.keys(input).forEach(fieldKey => {
                if (fieldKey.endsWith('Id')) {
                    let relationFieldKey = fieldKey.substr(0, fieldKey.length - 2);
                    let fieldDoc = modelDoc.fields[relationFieldKey];
                    if (fieldDoc && fieldDoc.relation && fieldDoc.relation.type === 'many-to-one') {
                        input[fieldKey] = deserializeId(input[fieldKey]);
                    }
                }
            });

            return connector.update(deserializeId(args.id), input).then(data => {
                return serializeIdInData(modelKey, data);
            });
        };

        if (isModelContainingRelations(modelDoc)) {
            resolver[modelDoc.name] = {};
            Object.keys(modelDoc.fields).forEach(fieldKey => {
                let fieldDoc = modelDoc.fields[fieldKey];
                if (fieldDoc.relation) {
                    resolver[modelDoc.name][fieldKey] = async (obj, args, context) => {
                        let foreignConnectorKey = fieldDoc.relation.foreignModelKey + 'Connector';
                        let foreignConnector = context[foreignConnectorKey];

                        if (fieldDoc.relation.type === 'many-to-one') {
                            let relationColumn = fieldDoc.relation.relationColumn;
                            let foreignId = obj[relationColumn];
                            let data = await foreignConnector.getOne(foreignId);
                            return serializeIdInData(fieldDoc.relation.foreignModelKey, data);
                        } else if (fieldDoc.relation.type === 'one-to-many') {
                            let relationField = fieldDoc.relation.foreignModelKey + 's';
                            let foreignIds = obj[relationField];
                            let data = await foreignConnector.getMany(foreignIds);
                            return serializeIdInData(fieldDoc.relation.foreignModelKey, data);
                        } else {
                            throw new Error('Unhandled relation type: ' + fieldDoc.relation.type);
                        }
                    };
                }
            });
        }
    });

    return resolver;
}
