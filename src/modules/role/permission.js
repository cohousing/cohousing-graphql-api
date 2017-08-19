export class Permission {
    static fromSqlValue(sqlValue) {
        return new Permission()
            .setCreate(sqlValue.substr(0, 1) === '1')
            .setRead(sqlValue.substr(1, 1) === '1')
            .setUpdate(sqlValue.substr(2, 1) === '1')
            .setDelete(sqlValue.substr(3, 1) === '1')
    }

    setCreate(create) {
        this.create = create;
        return this;
    }

    setRead(read) {
        this.read = read;
        return this;
    }

    setUpdate(update) {
        this.update = update;
        return this;
    }

    setDelete(del) {
        this.delete = del;
        return this;
    }

    hasCreate() {
        return this.create;
    }

    hasRead() {
        return this.read;
    }

    hasUpdate() {
        return this.update;
    }

    hasDelete() {
        return this.delete;
    }

    merge(permission) {
        if (permission.create) {
            this.create = true;
        }
        if (permission.read) {
            this.read = true;
        }
        if (permission.update) {
            this.update = true;
        }
        if (permission.delete) {
            this.delete = true;
        }
    }

    toSqlValue() {
        let sqlValue = '';

        sqlValue += this.create ? '1' : '0';
        sqlValue += this.read ? '1' : '0';
        sqlValue += this.update ? '1' : '0';
        sqlValue += this.delete ? '1' : '0';

        return sqlValue;
    }

    toExternal(resource) {
        let external = [];
        if (this.create) {
            external.push(resource + ':create');
        }
        if (this.read) {
            external.push(resource + ':read');
        }
        if (this.update) {
            external.push(resource + ':update');
        }
        if (this.delete) {
            external.push(resource + ':delete');
        }
        return external;
    }
}
