import {GraphQLScalarType} from 'graphql';
import {Kind} from 'graphql/language';
import fs from 'fs';
import moment from 'moment';

export const DateTimeSchema = fs.readFileSync(__dirname + '/datetime.graphqls', 'UTF-8');

export const DateTimeResolver = {
    DateTime: new GraphQLScalarType({
        name: 'DateTime',
        description: 'DateTime type represented in ISO (YYYY-MM-DD HH:mm:ss',
        parseValue(value) {
            console.log('parseValue', value);
            return new Date(value); // value from the client
        },
        serialize(value) {
            return moment(value).format('YYYY-MM-DD HH:mm:ss'); // value sent to the client
        },
        parseLiteral(ast) {
            console.log('parseLiteral', ast);
            if (ast.kind === Kind.INT) {
                return parseInt(ast.value, 10); // ast value is always in string format
            }
            return null;
        }
    })
};