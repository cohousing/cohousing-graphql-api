import fs from 'fs';
import {Schema as ResidentSchema} from '../resident';

const HomeSchema = fs.readFileSync(__dirname + '/home.graphqls', 'UTF-8');

export function Schema() {
    return [HomeSchema, ResidentSchema];
}

export const Resolver = {
    Query: {
        allHomes(obj, args, {homeConnector}) {
            return homeConnector.getAllHomes();
        },

        home(obj, args, {homeConnector}) {
            return homeConnector.getHome(args.id);
        }
    },

    Home: {
        residents(obj, args, {residentConnector}) {
            if (obj.residents) {
                return residentConnector.getResidents(obj.residents);
            }
            return [];
        }
    }
};