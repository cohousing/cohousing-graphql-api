import {createError} from 'apollo-errors';

export const UsernameNotAvailableError = createError('UsernameNotAvailableError', {
    message: 'Username is not available'
});

export const ResidentDoesNotExistError = createError('ResidentDoesNotExistError', {
    message: 'Resident does not exist'
});
