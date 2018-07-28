import DataLoader from "dataloader/index";
import sort from "dataloader-sort";
import {values, merge} from "lodash";

import {createAudit, OPERATION_CREATE, OPERATION_UPDATE} from "../audit";
import {BaseConnector} from "../baseconnector";
import {moduleRegistry} from './moduleregistry';

export class ModelConnector extends BaseConnector {
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
                })
                .then(result => {
                    //console.log(modelKey, result, result.length);
                    return result;
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
                elm = merge({}, val);
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
            return this._loader.load(id).then(data => {
                return data;
            });
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