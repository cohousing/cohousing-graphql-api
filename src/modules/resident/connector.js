import DataLoader from 'dataloader';

export class ResidentConnector {
    constructor(request) {
        this.db = request.tenant.db;

        this.loader = new DataLoader(ids => new Promise(resolve => {
            this.db.select().from('residents').whereIn('id', ids).then(resolve);
        }));
    }

    getAllResidents() {
        return this.db.select().from('residents');
    }

    getResident(id) {
        return this.loader.load(id);
    }

    getResidents(ids) {
        return this.loader.loadMany(ids);
    }
}