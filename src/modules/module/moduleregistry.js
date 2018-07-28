import {merge} from "lodash";

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

export const moduleRegistry = new ModuleRegistry();
