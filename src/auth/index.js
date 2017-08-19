import crypto from 'crypto';
import {readFileSync} from 'fs';
import {sign, verify} from 'jsonwebtoken';

import {Role} from "../modules/role/role";

export function auth(settings) {
    let publicKey = readFileSync(settings.auth.publicKeyPath);

    return (req, res, next) => {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            let idToken = req.headers.authorization.split(' ')[1];

            verify(idToken, publicKey, {
                audience: req.tenant.context
            }, (err, decoded) => {
                if (err) {
                    next(new Error(err));
                } else {
                    req.user = decoded;
                    next();
                }
            });
        } else {
            next();
        }
    };
}

export function login(settings) {
    let privateKey = readFileSync(settings.auth.privateKeyPath);

    return (req, res) => {
        let username = req.body.username;
        let password = req.body.password;

        if (username && password) {
            req.tenant.db('residents').where('username', username).then(users => {
                if (users.length === 1) {
                    let user = users[0];

                    let verifyPassword = crypto.pbkdf2Sync(password, user.salt, 10000, 64, 'sha512').toString('hex');

                    if (verifyPassword === user.password) {
                        req.tenant.db('residents_roles')
                            .join('roles', 'residents_roles.role_id', '=', 'roles.id')
                            .where('residents_roles.resident_id', user.id)
                            .then(roles => {
                                let resultRole = new Role();
                                roles.forEach(role => {
                                    resultRole.mergePermissionsWithSql(role);
                                });

                                let idToken = sign({
                                    permission: resultRole.toExternalPermissions()
                                }, {
                                    key: privateKey,
                                    passphrase: settings.auth.privateKeyPassphrase
                                }, {
                                    algorithm: 'RS512',
                                    expiresIn: '1h',
                                    audience: req.tenant.context,
                                    subject: username
                                });

                                res.redirect("/?id_token=" + idToken);
                            });
                    } else {
                        res.status(401).send();
                    }
                } else {
                    res.status(401).send();
                }
            });
        } else {
            res.status(400).send({
                errorCode: 'username-password-required',
                error: 'Both username and password is required.'
            });
        }
    };
}