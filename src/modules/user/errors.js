import {createError} from 'apollo-errors';

export const UserDoesNotExistError = createError('UserDoesNotExistError', {
    message: 'User does not exist'
});

export const UsernameNotAvailableError = createError('UsernameNotAvailableError', {
    message: 'Username is not available'
});

export const ResidentDoesNotExistError = createError('ResidentDoesNotExistError', {
    message: 'Resident does not exist'
});
