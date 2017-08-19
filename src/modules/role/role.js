import {Permission} from "./permission";

export class Role {
    constructor() {
        this.home = new Permission();
        this.resident = new Permission();
        this.role = new Permission();
    }

    toExternalPermissions() {
        return [].concat(
            this.home.toExternal('home'),
            this.resident.toExternal('resident'),
            this.role.toExternal('role')
        );
    }

    mergePermissionsWithSql(sqlValue) {
        this.home.merge(Permission.fromSqlValue(sqlValue.home));
        this.resident.merge(Permission.fromSqlValue(sqlValue.resident));
        this.role.merge(Permission.fromSqlValue(sqlValue.role));
    }
}