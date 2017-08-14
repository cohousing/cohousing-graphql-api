import DataLoader from 'dataloader';
import {db} from '../../db';

export class ResidentConnector {
    constructor() {

        this.loader = new DataLoader(ids => new Promise(resolve => {
            db.select().from('residents').whereIn('id', ids).then(resolve);
        }));
    }

    getAllResidents() {
        return db.select().from('residents');
    }

    getResident(id) {
        return this.loader.load(id);
    }

    getResidents(ids) {
        return this.loader.loadMany(ids);
    }
}