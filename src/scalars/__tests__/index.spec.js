import {ScalarSchemas, ScalarResolvers} from '../index';

import {DateTimeSchema, DateTimeResolver} from '../datetime';

describe('Scalar schemas', () => {
    it('should contain all custom scalars', () => {
        expect(ScalarSchemas()).toHaveLength(1);
        expect(ScalarSchemas()).toContain(DateTimeSchema);
    });
});


describe('Scalar resolvers', () => {
    it('should contain all custom scalars', () => {
        expect(ScalarResolvers).toHaveProperty('DateTime', DateTimeResolver.DateTime);
    });
});
