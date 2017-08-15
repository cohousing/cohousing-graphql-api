import {merge} from 'lodash';

import {ModuleContexts} from './modules'

export function context(request) {
    return merge(
        {
            tenant: request.tenant
        },
        ModuleContexts(request)
    );
}