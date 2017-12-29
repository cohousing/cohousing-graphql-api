import {GraphQLScalarType} from 'graphql';
import fs from 'fs';
import moment from 'moment';

export const DateTimeSchema = fs.readFileSync(__dirname + '/datetime.graphqls', 'UTF-8');

export const DateTimeResolver = {
    DateTime: new GraphQLScalarType({
        name: 'DateTime',
        description: 'DateTime type represented in ISO (YYYY-MM-DD HH:mm:ss',
        serialize(value) {
            return moment(value).format('YYYY-MM-DD HH:mm:ss'); // value sent to the client
        }
    })
};