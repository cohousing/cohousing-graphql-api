import {readFileSync} from 'fs';
import {sign, verify} from 'jsonwebtoken';

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
        let idToken = sign({
            permission: [
                'home:read',
                'resident:read'
            ]
        }, {
            key: privateKey,
            passphrase: settings.auth.privateKeyPassphrase
        }, {
            algorithm: 'RS512',
            expiresIn: '1h',
            audience: req.tenant.context
        });

        res.redirect("/?id_token=" + idToken);
    };
}