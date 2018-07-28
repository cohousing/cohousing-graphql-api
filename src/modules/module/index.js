import {safeLoad} from "js-yaml";
import {merge} from "lodash";

import {ModelConnector} from './modelconnector';
import {createResolver} from './createresolver';
import {createSchema} from './createschema';
import {moduleRegistry} from './moduleregistry';

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