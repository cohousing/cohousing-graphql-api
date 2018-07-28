import {capitalize, merge} from "lodash";

function createModelSchema(modelKey, modelDoc) {
    let schema = '';

    let plural = modelDoc.plural ? modelDoc.plural : modelKey + 's';

    if (modelDoc.doc) {
        schema += '# ' + modelDoc.doc + '\n';
    }
    schema += 'type ' + modelDoc.name + ' {\n';
    Object.keys(modelDoc.fields).forEach(fieldKey => {
        let fieldDoc = modelDoc.fields[fieldKey];
        let fieldDescription = fieldDoc.type;
        if (fieldDoc.required) {
            fieldDescription += '!';
        }

        schema += '\t' + fieldKey + ': ' + fieldDescription + '\n';
    });
    schema += '}\n\n';

    schema += 'input ' + modelDoc.name + 'CreateInput {\n';
    Object.keys(modelDoc.fields).forEach(fieldKey => {
        let fieldDoc = modelDoc.fields[fieldKey];
        if ('id' !== fieldKey && !fieldDoc.relation && !fieldDoc.systemDefined) {
            let fieldDescription = fieldDoc.type;
            if (fieldDoc.required) {
                fieldDescription += '!';
            }

            schema += '\t' + fieldKey + ': ' + fieldDescription + '\n';
        } else if (fieldDoc.relation && fieldDoc.relation.type === 'many-to-one') {
            let fieldName = fieldKey + 'Id';
            let fieldDescription = 'ID';
            if (fieldDoc.required) {
                fieldDescription += '!';
            }

            schema += '\t' + fieldName + ': ' + fieldDescription + '\n';
        }
    });
    schema += '}\n\n';

    schema += 'input ' + modelDoc.name + 'UpdateInput {\n';
    Object.keys(modelDoc.fields).forEach(fieldKey => {
        let fieldDoc = modelDoc.fields[fieldKey];
        if ('id' !== fieldKey && !fieldDoc.relation && !fieldDoc.systemDefined) {
            schema += '\t' + fieldKey + ': ' + fieldDoc.type + '\n';
        } else if (fieldDoc.relation && fieldDoc.relation.type === 'many-to-one') {
            let fieldName = fieldKey + 'Id';
            let fieldDescription = 'ID';

            schema += '\t' + fieldName + ': ' + fieldDescription + '\n';
        }
    });
    schema += '}\n\n';

    schema += 'input ' + modelDoc.name + 'Where {\n';
    schema += '\tAND: [' + modelDoc.name + 'Where!]\n';
    schema += '\tOR: [' + modelDoc.name + 'Where!]\n';
    Object.keys(modelDoc.fields).forEach(fieldKey => {
        let fieldDoc = modelDoc.fields[fieldKey];

        if (!fieldDoc.relation) {
            schema += '\t' + fieldKey + '_eq: ' + fieldDoc.type + '\n';
            schema += '\t' + fieldKey + '_not_eq: ' + fieldDoc.type + '\n';
        }
        if (fieldDoc.type === 'String' || fieldDoc.type === 'Int' || fieldDoc.type === 'DateTime') {
            schema += '\t' + fieldKey + '_gt: ' + fieldDoc.type + '\n';
            schema += '\t' + fieldKey + '_gte: ' + fieldDoc.type + '\n';
            schema += '\t' + fieldKey + '_lt: ' + fieldDoc.type + '\n';
            schema += '\t' + fieldKey + '_lte: ' + fieldDoc.type + '\n';
            schema += '\t' + fieldKey + '_in: [' + fieldDoc.type + '!]\n';
            schema += '\t' + fieldKey + '_not_in: [' + fieldDoc.type + '!]\n';
        }
        if (fieldDoc.type === 'String') {
            schema += '\t' + fieldKey + '_contains: ' + fieldDoc.type + '\n';
            schema += '\t' + fieldKey + '_not_contains: ' + fieldDoc.type + '\n';
        }
    });
    schema += '}\n\n';

    schema += 'enum ' + modelDoc.name + 'SortOrder {\n';
    Object.keys(modelDoc.fields).forEach(fieldKey => {
        let fieldDoc = modelDoc.fields[fieldKey];

        if (!fieldDoc.relation) {
            schema += '\t' + fieldKey + '_ASC\n';
            schema += '\t' + fieldKey + '_DESC\n';
        }
    });
    schema += '}\n\n';

    schema += 'extend type Query {\n';
    schema += '\t' + modelKey + '(id: ' + modelDoc.fields.id.type + '!): ' + modelDoc.name + '\n';
    schema += '\t' + plural + '(where: ' + modelDoc.name + 'Where, sortOrder: ' + modelDoc.name + 'SortOrder): [' + modelDoc.name + '!]\n';
    schema += '}\n\n';

    schema += 'extend type Mutation {\n';
    schema += '\tcreate' + capitalize(modelKey) + '(' + modelKey + ': ' + modelDoc.name + 'CreateInput!): ' + modelDoc.name + '!\n';
    schema += '\tupdate' + capitalize(modelKey) + '(id: ' + modelDoc.fields.id.type + ', ' + modelKey + ': ' + modelDoc.name + 'UpdateInput!): ' + modelDoc.name + '!\n';
    schema += '\tdelete' + capitalize(modelKey) + '(where: ' + modelDoc.name + 'Where): Int!\n';
    schema += '}\n\n';

    return schema;
}

function enhanceModel(modelDoc) {
    let fields = {
        id: {
            type: 'ID',
            required: true,
            systemDefined: true
        }
    };

    modelDoc.fields = merge(fields, modelDoc.fields);

    return modelDoc;
}

export function createSchema(moduleDoc) {
    let schema = '';

    Object.keys(moduleDoc.models).forEach(modelKey => {
        let modelDoc = enhanceModel(moduleDoc.models[modelKey]);

        schema += createModelSchema(modelKey, modelDoc);
    });

    return schema;
}
