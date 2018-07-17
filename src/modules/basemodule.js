import {capitalize, merge, values} from 'lodash';
import {safeLoad} from 'js-yaml';
import DataLoader from 'dataloader';
import sort from 'dataloader-sort';

import {BaseConnector} from './baseconnector';
import {createAudit, OPERATION_CREATE, OPERATION_UPDATE} from './audit';

function createModelSchema(modelKey, modelDoc) {
    let schema = '';

    let plural = modelDoc.plural ? modelDoc.plural : modelKey + 's';

    if (modelDoc.doc) {
        schema += '# ' + modelDoc.doc + '\n';
    }
    schema += 'type ' + modelDoc.name + ' {\n';
    Object.keys(modelDoc.fields).forEach(fieldKey => {
        let fieldDoc = modelDoc.fields[fieldKey];
        let fieldDescription = fieldDoc.type;
        if (fieldDoc.required) {
            fieldDescription += '!';
        }

        schema += '\t' + fieldKey + ': ' + fieldDescription + '\n';
    });
    schema += '}\n\n';

    schema += 'input ' + modelDoc.name + 'CreateInput {\n';
    Object.keys(modelDoc.fields).forEach(fieldKey => {
        let fieldDoc = modelDoc.fields[fieldKey];
        if ('id' !== fieldKey && !fieldDoc.relation && !fieldDoc.systemDefined) {
            let fieldDescription = fieldDoc.type;
            if (fieldDoc.required) {
                fieldDescription += '!';
            }

            schema += '\t' + fieldKey + ': ' + fieldDescription + '\n';
        } else if (fieldDoc.relation && fieldDoc.relation.type === 'many-to-one') {
            let fieldName = fieldKey + 'Id';
            let fieldDescription = 'ID';
            if (fieldDoc.required) {
                fieldDescription += '!';
            }

            schema += '\t' + fieldName + ': ' + fieldDescription + '\n';
        }
    });
    schema += '}\n\n';

    schema += 'input ' + modelDoc.name + 'UpdateInput {\n';
    Object.keys(modelDoc.fields).forEach(fieldKey => {
        let fieldDoc = modelDoc.fields[fieldKey];
        if ('id' !== fieldKey && !fieldDoc.relation && !fieldDoc.systemDefined) {
            schema += '\t' + fieldKey + ': ' + fieldDoc.type + '\n';
        } else if (fieldDoc.relation && fieldDoc.relation.type === 'many-to-one') {
            let fieldName = fieldKey + 'Id';
            let fieldDescription = 'ID';

            schema += '\t' + fieldName + ': ' + fieldDescription + '\n';
        }
    });
    schema += '}\n\n';

    schema += 'input ' + modelDoc.name + 'Where {\n';
    schema += '\tAND: [' + modelDoc.name + 'Where!]\n';
    schema += '\tOR: [' + modelDoc.name + 'Where!]\n';
    Object.keys(modelDoc.fields).forEach(fieldKey => {
        let fieldDoc = modelDoc.fields[fieldKey];

        if (!fieldDoc.relation) {
            schema += '\t' + fieldKey + '_eq: ' + fieldDoc.type + '\n';
            schema += '\t' + fieldKey + '_not_eq: ' + fieldDoc.type + '\n';
        }
        if (fieldDoc.type === 'String' || fieldDoc.type === 'Int' || fieldDoc.type === 'DateTime') {
            schema += '\t' + fieldKey + '_gt: ' + fieldDoc.type + '\n';
            schema += '\t' + fieldKey + '_gte: ' + fieldDoc.type + '\n';
            schema += '\t' + fieldKey + '_lt: ' + fieldDoc.type + '\n';
            schema += '\t' + fieldKey + '_lte: ' + fieldDoc.type + '\n';
            schema += '\t' + fieldKey + '_in: [' + fieldDoc.type + '!]\n';
            schema += '\t' + fieldKey + '_not_in: [' + fieldDoc.type + '!]\n';
        }
        if (fieldDoc.type === 'String') {
            schema += '\t' + fieldKey + '_contains: ' + fieldDoc.type + '\n';
            schema += '\t' + fieldKey + '_not_contains: ' + fieldDoc.type + '\n';
        }
    });
    schema += '}\n\n';

    schema += 'enum ' + modelDoc.name + 'SortOrder {\n';
    Object.keys(modelDoc.fields).forEach(fieldKey => {
        let fieldDoc = modelDoc.fields[fieldKey];

        if (!fieldDoc.relation) {
            schema += '\t' + fieldKey + '_ASC\n';
            schema += '\t' + fieldKey + '_DESC\n';
        }
    });
    schema += '}\n\n';

    schema += 'extend type Query {\n';
    schema += '\t' + modelKey + '(id: ' + modelDoc.fields.id.type + '!): ' + modelDoc.name + '\n';
    schema += '\t' + plural + '(where: ' + modelDoc.name + 'Where, sortOrder: ' + modelDoc.name + 'SortOrder): [' + modelDoc.name + '!]\n';
    schema += '}\n\n';

    schema += 'extend type Mutation {\n';
    schema += '\tcreate' + capitalize(modelKey) + '(' + modelKey + ': ' + modelDoc.name + 'CreateInput!): ' + modelDoc.name + '!\n';
    schema += '\tupdate' + capitalize(modelKey) + '(id: ' + modelDoc.fields.id.type + ', ' + modelKey + ': ' + modelDoc.name + 'UpdateInput!): ' + modelDoc.name + '!\n';
    schema += '\tdelete' + capitalize(modelKey) + '(where: ' + modelDoc.name + 'Where): Int!\n';
    schema += '}\n\n';

    return schema;
}

function enhanceModel(modelDoc) {
    let fields = {
        id: {
            type: 'ID',
            required: true,
            systemDefined: true
        }
    };

    modelDoc.fields = merge(fields, modelDoc.fields);

    return modelDoc;
}

function createSchema(moduleDoc) {
    let schema = '';

    Object.keys(moduleDoc.models).forEach(modelKey => {
        let modelDoc = enhanceModel(moduleDoc.models[modelKey]);

        schema += createModelSchema(modelKey, modelDoc);
    });

    return schema;
}

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
    return Buffer.from(modelKey + ':' + id).toString('base64')
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

function createResolver(moduleDoc) {
    let resolver = {
        Query: {},
        Mutation: {}
    };

    Object.keys(moduleDoc.models).forEach(modelKey => {
        let modelDoc = enhanceModel(moduleDoc.models[modelKey]);
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
                    resolver[modelDoc.name][fieldKey] = (obj, args, context) => {
                        let foreignConnectorKey = fieldDoc.relation.foreignModelKey + 'Connector';
                        let foreignConnector = context[foreignConnectorKey];

                        if (fieldDoc.relation.type === 'many-to-one') {
                            let relationColumn = fieldDoc.relation.relationColumn;
                            let foreignId = obj[relationColumn];
                            return foreignConnector.getOne(foreignId).then(data => {
                                return serializeIdInData(fieldDoc.relation.foreignModelKey, data);
                            });
                        } else if (fieldDoc.relation.type === 'one-to-many') {
                            let relationField = fieldDoc.relation.foreignModelKey + 's';
                            let foreignIds = obj[relationField];
                            return foreignConnector.getMany(foreignIds).then(data => {
                                return serializeIdInData(fieldDoc.relation.foreignModelKey, data);
                            });
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

class ModelConnector extends BaseConnector {
    constructor(request, modelKey, modelDoc) {
        super(request);
        this._db = request.tenant.db;
        this._modelKey = modelKey;
        this._modelDoc = modelDoc;
        this._plural = modelDoc.plural ? modelDoc.plural : modelKey + 's';

        this._loader = new DataLoader(ids => {
            return this._applyRelationCriteria(this._db(this._plural)
                .whereIn(this._plural + '.id', ids))
                .then(dataArray => {
                    return sort(ids, this._flattenData(dataArray));
                });
        });
    }

    _applyRelationCriteria(query) {
        let selects = [this._plural + '.*'];

        Object.keys(this._modelDoc.fields).forEach(fieldKey => {
            let fieldDoc = this._modelDoc.fields[fieldKey];
            if (fieldDoc.relation && fieldDoc.relation.type === 'one-to-many') {
                let foreignModelDoc = moduleRegistry.getModelByKey(fieldDoc.relation.foreignModelKey);
                let foreignPlural = foreignModelDoc.plural ? foreignModelDoc.plural : fieldDoc.relation.foreignModelKey + 's';
                query = query.leftOuterJoin(foreignPlural, this._plural + '.id', '=', foreignPlural + '.' + fieldDoc.relation.relationColumn);
                selects.push(foreignPlural + '.id AS ' + fieldDoc.relation.foreignModelKey + '_id');
            }
        });

        query = query.select(selects);

        return query;
    }

    _flattenData(data) {
        let relationFields = {};
        Object.keys(this._modelDoc.fields).forEach(fieldKey => {
            let fieldDoc = this._modelDoc.fields[fieldKey];
            if (fieldDoc.relation && fieldDoc.relation.type === 'one-to-many') {
                relationFields[fieldKey] = fieldDoc.relation.foreignModelKey + '_id';
            }
        });

        return values(data.reduce((flat, val) => {
            let elm = flat[val.id];
            if (!elm) {
                elm = val;
                Object.keys(relationFields).forEach(fieldKey => {
                    elm[fieldKey] = [];
                });
                flat[val.id] = elm;
            }

            Object.keys(relationFields).forEach(fieldKey => {
                let fieldColumn = relationFields[fieldKey];
                if (val[fieldColumn]) {
                    elm[fieldKey].push(val[fieldColumn]);
                    delete val[fieldColumn];
                }
            });

            return flat;
        }, {}));
    }

    authzCreate() {
        return this.authz(this._modelKey + ':create');
    }

    authzRead() {
        return this.authz(this._modelKey + ':read');
    }

    authzUpdate() {
        return this.authz(this._modelKey + ':update');
    }

    getOne(id) {
        return this.authzRead().then(() => {
            return this._loader.load(id);
        });
    }

    getMany(ids) {
        return this.authzRead().then(() => {
            return this._loader.loadMany(ids);
        });
    }

    getAll() {
        return this.authzRead().then(() => {
            return this._applyRelationCriteria(this._db(this._plural)).then(data => {
                return this._flattenData(data);
            });
        });
    }

    create(input) {
        let self = this;
        return self.authzCreate().then(() => {
            return self._db(self._plural).insert(input).then(id => {
                let changeObject = {};
                Object.keys(input).forEach(field => {
                    let fieldValue = input[field];

                    changeObject[field] = {
                        o: null,
                        n: fieldValue
                    }
                });

                createAudit(self._db, self.loggedInUser, self._modelKey, id, OPERATION_CREATE, changeObject);
                return self._loader.load(id[0]);
            });
        });
    }

    update(id, input) {
        let self = this;
        return this.authzUpdate().then(() => {
            return self._db(self._plural)
                .where('id', id).then(results => {
                    if (results.length !== 1) {
                        throw new Error('No ' + this._modelDoc.name + ' found with id ' + id);
                    }

                    return self._db(self._plural)
                        .where('id', id)
                        .update(input).then(() => {
                            let changeObject = {};
                            Object.keys(input).forEach(field => {
                                let fieldValue = input[field];

                                changeObject[field] = {
                                    o: results[0][field],
                                    n: fieldValue
                                }
                            });

                            createAudit(self._db, self.loggedInUser, self._modelKey, id, OPERATION_UPDATE, changeObject);
                            return self._loader.load(id);
                        });
                });
        });
    }
}

class ModuleRegistry {
    constructor() {
        this._modules = [];
        this._models = {};
    }

    registerModule(module) {
        this._modules.push(module);
        this._models = merge(this._models, module.getModelDocs());
    }

    getModelByKey(modelKey) {
        return this._models[modelKey];
    }
}

const moduleRegistry = new ModuleRegistry();

class Module {
    constructor(moduleDoc) {
        this._moduleDoc = moduleDoc;
        this._schema = null;
        this._resolver = null;
        moduleRegistry.registerModule(this);
    }

    getModelDocs() {
        return this._moduleDoc.models;
    }

    getSchema() {
        if (this._schema === null) {
            this._schema = createSchema(this._moduleDoc);
        }
        return this._schema;
    }

    getResolver() {
        if (this._resolver === null) {
            this._resolver = createResolver(this._moduleDoc);
        }
        return this._resolver;
    }

    createContext(request) {
        let context = {};
        Object.keys(this._moduleDoc.models).forEach(modelKey => {
            let modelDoc = this._moduleDoc.models[modelKey];

            context[modelKey + 'Connector'] = new ModelConnector(request, modelKey, modelDoc);
        });
        return context;
    }
}

export function createModule(moduleYaml) {
    try {
        let moduleDoc = safeLoad(moduleYaml);

        return new Module(moduleDoc);
    } catch (e) {
        console.error(e);
        throw e;
    }
}
