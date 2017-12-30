import {context} from '../context';

describe('Context function', () => {
    let request = {
        tenant: {
            name: 'Dummy Tenant'
        }
    };

    it('should add tenant to context', () => {
        let mergedContext = context(request);

        expect(mergedContext).toHaveProperty('tenant', request.tenant);
    });
});