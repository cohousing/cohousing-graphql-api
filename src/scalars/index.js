import {merge} from "lodash";

import {DateTimeSchema, DateTimeResolver} from './datetime';

export function ScalarSchemas() {
    return [
        DateTimeSchema
    ]
}

export const ScalarResolvers = merge(
    DateTimeResolver
);