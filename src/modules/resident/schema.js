import fs from 'fs';
import {Schema as HomeSchema} from '../home';

const ResidentSchema = fs.readFileSync(__dirname + '/resident.graphqls', 'UTF-8');

export function Schema() {
    return [ResidentSchema, HomeSchema];
}

export const Resolver = {
    Query: {
        allResidents(obj, args, {residentConnector}) {
            return residentConnector.getAllResidents();
        },

        resident(obj, args, {residentConnector}) {
            return residentConnector.getResident(args.id);
        }
    },

    Mutation: {
        createResident(obj, args, {residentConnector}) {
            return residentConnector.createResident(args.name, args.username, args.password, args.homeId);
        },

        updateResident(obj, args, {residentConnector}) {
            return residentConnector.updateResident(args.id, args.name, args.homeId);
        }
    },

    Resident: {
        home(obj, args, {homeConnector}) {
            if (obj.home_id) {
                return homeConnector.getHome(obj.home_id);
            }
            return null;
        }
    }
};