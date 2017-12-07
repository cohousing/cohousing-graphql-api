import {createError} from 'apollo-errors';

export const InputValidationError = createError('InputValidationError', {
    message: 'Input is not valid'
});

export const UnauthorizedError = createError('UnauthorizedError', {
    message: 'User doesn\'t have the correct permissions for this operation.'
});