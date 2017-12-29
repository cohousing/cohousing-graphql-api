import {DateTimeSchema, DateTimeResolver} from '../datetime';

describe('DateTime schema', () => {
    it('should match', () => {
        expect(DateTimeSchema).toMatchSnapshot();
    });
});

describe('DateTime resolver', () => {
    it('should be an object', () => {
        expect(typeof(DateTimeResolver)).toBe('object');
        expect(typeof(DateTimeResolver.DateTime)).toBe('object');
    });

    it('should define DateTime as Scalar type', () => {
        expect(DateTimeResolver.DateTime.name).toBe('DateTime');
    });

    it('should define serialize', () => {
        let date = new Date(2017, 11, 29, 15, 3, 50, 0);
        let serializedDate = DateTimeResolver.DateTime.serialize(date);

        expect(serializedDate).toBe('2017-12-29 15:03:50');
    });
});