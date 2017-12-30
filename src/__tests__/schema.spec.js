import {schema} from '../schema';

describe('Schema const', () => {
    it('should contain root schema', () => {
        expect(schema.getType('Query')).not.toBeNull();
        expect(schema.getType('TenantInfo')).not.toBeNull();
        expect(schema.getType('Mutation')).not.toBeNull();
    });
});