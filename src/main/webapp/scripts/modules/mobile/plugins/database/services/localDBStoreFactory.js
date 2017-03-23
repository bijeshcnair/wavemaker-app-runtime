/*global wm, WM, FileTransfer, _*/
/*jslint sub: true */

/**
 * @ngdoc service
 * @name wm.plugins.database.services.$LocalDBStoreFactory
 * @description
 * A factory to create the database stores. This implementation requires Cordova-sqlite-storage plugin.
 */
wm.plugins.database.services.LocalDBStoreFactory = [
    "$q",
    "$cordovaSQLite",
    function ($q, $cordovaSQLite) {
        'use strict';

        function escapeName(name) {
            if (name) {
                name = name.replace(/"/g, '""');
                return '"' + name + '"';
            }
        }

        function createTableSql(schema) {
            var fieldStr = _.reduce(schema.columns, function (result, f) {
                var str = escapeName(f.name);
                if (f.primaryKey) {
                    if (f.sqlType === 'number' && f.generatorType === 'identity') {
                        str += ' INTEGER PRIMARY KEY AUTOINCREMENT';
                    } else {
                        str += ' PRIMARY KEY';
                    }
                }
                return result ? result + ',' + str : str;
            }, false);
            return 'CREATE TABLE IF NOT EXISTS ' + escapeName(schema.name) + ' (' + fieldStr + ')';
        }

        function dropTable(schema) {
            return 'DROP TABLE IF EXISTS ' + escapeName(schema.name);
        }

        function insertRecordSqlTemplate(schema) {
            var columnNames = [],
                placeHolder = [];
            _.forEach(schema.columns, function (col) {
                columnNames.push(escapeName(col.name));
                placeHolder.push('?');
            });
            return 'INSERT INTO ' + escapeName(schema.name) + ' (' + columnNames.join(',') + ') VALUES (' + placeHolder.join(',') + ')';
        }

        function updateRecordSqlTemplate(schema) {
            var idClause = '',
                fields = [];
            _.forEach(schema.columns, function (field) {
                if (field.primaryKey) {
                    idClause = escapeName(field.name) + ' = ?';
                } else {
                    fields.push(escapeName(field.name) + ' = ?');
                }
            });
            return 'UPDATE ' + escapeName(schema.name) + ' SET ' + fields.join(',') + ' WHERE ' + idClause;
        }

        function deleteRecordTemplate(schema) {
            var primaryKeyField = _.find(schema.columns, 'primaryKey');
            if (primaryKeyField) {
                return 'DELETE FROM ' + escapeName(schema.name) + ' WHERE ' + escapeName(primaryKeyField.name) + ' = ?';
            }
            return '';
        }

        function selectSqlTemplate(schema) {
            var columns = [],
                joins = [];
            _.forEach(schema.columns, function (col) {
                var childTableName;
                columns.push(escapeName(schema.name) + '.' + escapeName(col.name) + ' as ' + col.fieldName);
                if (col.targetEntity) {
                    childTableName = col.sourceFieldName;
                    _.forEach(col.dataMapper, function (childCol, childFiledName) {
                        columns.push(childTableName + '.' + escapeName(childCol.name) + ' as \'' + childFiledName + '\'');
                    });
                    joins.push(' LEFT JOIN ' + escapeName(col.targetTable) + ' ' + childTableName
                        + ' ON ' + childTableName + '.' + escapeName(col.targetColumn)
                        + ' = ' + escapeName(schema.name) + '.' +  escapeName(col.name));
                }
            });
            return 'SELECT ' + columns.join(',') + ' FROM ' + escapeName(schema.name) + ' ' + joins.join(' ');
        }

        function countQuery(schema) {
            return 'SELECT COUNT(*) as count FROM ' + escapeName(schema.name);
        }

        function generateWherClause(store, filterCriteria) {
            var conditions,
                fieldToColumnMapping = store.fieldToColumnMapping,
                tableName = store.schema.name;
            conditions = _.map(filterCriteria, function (filterCriterion) {
                var colName = fieldToColumnMapping[filterCriterion.attributeName],
                    condition = filterCriterion.filterCondition,
                    target = filterCriterion.attributeValue,
                    operator = '=';
                if (filterCriterion.attributeType === 'STRING') {
                    if (condition === 'STARTING_WITH') {
                        target = target + '%';
                        operator = 'like';
                    } else if (condition === 'ENDING_WITH') {
                        target = '%' + target;
                        operator = 'like';
                    } else if (condition === 'CONTAINING') {
                        target = '%' + target + '%';
                        operator = 'like';
                    }
                    target = "'" + target + "'";
                }
                return escapeName(tableName) + '.' + escapeName(colName) + ' ' + operator + ' ' + target;
            });
            return conditions && conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';
        }

        function generateOrderByClause(store, sort) {
            if (sort) {
                return ' ORDER BY ' + _.map(sort.split(','), function (field) {
                    var splits =  _.trim(field).split(' ');
                    splits[0] = escapeName(store.schema.name) + '.' + escapeName(store.fieldToColumnMapping[splits[0]]);
                    return splits.join(' ');
                }).join(',');
            }
            return '';
        }

        function geneateLimitClause(page) {
            page = page || {};
            return ' LIMIT ' + (page.limit || 100) + ' OFFSET ' + (page.offset || 0);
        }

        function mapRowDataToObj(schema, dataObj) {
            _.forEach(schema.columns, function (col) {
                var childEntity;
                if (col.targetEntity) {
                    _.forEach(col.dataMapper, function (childCol, childFieldName) {
                        if (dataObj[childFieldName]) {
                            childEntity = childEntity || {};
                            childEntity[childCol.fieldName] = dataObj[childFieldName];
                        }
                        delete dataObj[childFieldName];
                    });
                    dataObj[col.sourceFieldName] = childEntity;
                }
            });
            return dataObj;
        }

        function mapObjToRow(store, entity) {
            var row = {};
            _.forEach(store.schema.columns, function (col) {
                row[col.name] = entity[col.fieldName];
                if (col.targetEntity && entity[col.sourceFieldName]) {
                    row[col.name] = entity[col.sourceFieldName][col.targetFieldName];
                }
            });
            return row;
        }
        /**
         * @ngdoc object
         * @name wm.plugins.database.services.$LocalDBStoreFactory.$Store
         */
        var Store = function (dbConnection, schema) {
            var self = this;
            this.dbConnection = dbConnection;
            this.schema = schema;
            this.fieldToColumnMapping = {};
            this.primaryKeyField = _.find(schema.columns, 'primaryKey');
            this.primaryKeyName = this.primaryKeyField ? this.primaryKeyField.fieldName : undefined;
            this.insertRecordSqlTemplate = insertRecordSqlTemplate(schema);
            this.updateRecordSqlTemplate = updateRecordSqlTemplate(schema);
            this.deleteRecordTemplate = deleteRecordTemplate(schema);
            this.selectSqlTemplate = selectSqlTemplate(schema);
            this.countQuery = countQuery(schema);
            _.forEach(schema.columns, function (c) {
                self.fieldToColumnMapping[c.fieldName] = c.name;
                if (c.targetPath) {
                    self.fieldToColumnMapping[c.targetPath] = c.name;
                }
            });
        };

        _.extend(Store.prototype, {
            /**
             * @ngdoc method
             * @name wm.plugins.database.services.$LocalDBStoreFactory.$Store#create
             * @methodOf wm.plugins.database.services.$LocalDBStoreFactory.$Store
             * @description
             * Creates the stores if it not exists.
             * @returns {object} promise
             */
            'create': function () {
                return $cordovaSQLite.execute(this.dbConnection, createTableSql(this.schema));
            },
            /**
             * @ngdoc method
             * @name wm.plugins.database.services.$LocalDBStoreFactory.$Store#drop
             * @methodOf wm.plugins.database.services.$LocalDBStoreFactory.$Store
             * @description
             * Drops the stores if exists.
             * @returns {object} promise
             */
            'drop': function () {
                return $cordovaSQLite.execute(this.dbConnection, dropTable(this.schema));
            },
            /**
             * @ngdoc method
             * @name wm.plugins.database.services.$LocalDBStoreFactory.$Store#add
             * @methodOf wm.plugins.database.services.$LocalDBStoreFactory.$Store
             * @description
             * adds the given entity to the store.
             * @param {object} entity the entity to add
             * @returns {object} promise
             */
            'add': function (entity) {
                var defer = $q.defer(),
                    params = [],
                    rowData,
                    idValue;
                if (this.primaryKeyName) {
                    idValue = entity[this.primaryKeyName];
                    if (this.primaryKeyField.sqlType === 'number'
                            && _.isString(idValue)
                            && _.isEmpty(_.trim(idValue))) {
                        entity[this.primaryKeyName] = undefined;
                    }
                }
                rowData = mapObjToRow(this, entity);
                _.forEach(this.schema.columns, function (f) {
                    params.push(rowData[f.name]);
                });
                $cordovaSQLite.execute(this.dbConnection, this.insertRecordSqlTemplate, params).then(function (result) {
                    defer.resolve(result.insertId);
                }, defer.reject.bind());
                return defer.promise;
            },
            /**
             * @ngdoc method
             * @name wm.plugins.database.services.$LocalDBStoreFactory.$Store#save
             * @methodOf wm.plugins.database.services.$LocalDBStoreFactory.$Store
             * @description
             * saves the given entity to the store. If the record is not available, then a new record will be created.
             * @param {object} entity the entity to save
             * @returns {object} promise
             */
            'save': function (entity) {
                var defer = $q.defer(),
                    self = this,
                    params = [],
                    pk = 0,
                    rowData = mapObjToRow(this, entity);
                _.forEach(this.schema.columns, function (f) {
                    if (f.primaryKey) {
                        pk = rowData[f.name];
                    } else {
                        params.push(rowData[f.name]);
                    }
                });
                params.push(pk);
                $cordovaSQLite.execute(this.dbConnection, this.updateRecordSqlTemplate, params).then(function (result) {
                    if (result.rowsAffected === 0) {
                        self.add(entity).then(function (result) {
                            defer.resolve(result);
                        });
                    } else {
                        defer.resolve();
                    }
                });
                return defer.promise;
            },
            /**
             * @ngdoc method
             * @name wm.plugins.database.services.$LocalDBStoreFactory.$Store#count
             * @methodOf wm.plugins.database.services.$LocalDBStoreFactory.$Store
             * @description
             * counts the number of records that satisfy the given filter criteria.
             * @param {object} filterCriteria [{"attributeName" : '',
             *                          "filterCondition" : '',
             *                          "attributeValue" : '',
             *                          "attributeType": '' }...]
             * @returns {object} promise that is resolved with count
             */
            'count' : function (filterCriteria) {
                var sql = this.countQuery + generateWherClause(this, filterCriteria);
                return $cordovaSQLite.execute(this.dbConnection, sql).then(function (result) {
                    return result.rows.item(0)['count'];
                });
            },
            /**
             * @ngdoc method
             * @name wm.plugins.database.services.$LocalDBStoreFactory.$Store#get
             * @methodOf wm.plugins.database.services.$LocalDBStoreFactory.$Store
             * @description
             * finds the record with the given primary key.
             * @param  {object} primaryKey primary key of the record
             * @returns {object} promise that is resolved with entity
             */
            'get': function (primaryKey) {
                var filterCriteria = [{"attributeName" : this.primaryKeyName,
                                        "filterCondition" : '=',
                                        "attributeValue" : primaryKey,
                                        "attributeType": 'INTEGER' }];
                return this.filter([filterCriteria]).then(function (obj) {
                    return obj && obj.length === 1 ? obj[0] : undefined;
                });
            },
            /**
             * @ngdoc method
             * @name wm.plugins.database.services.$LocalDBStoreFactory.$Store#delete
             * @methodOf wm.plugins.database.services.$LocalDBStoreFactory.$Store
             * @description
             * deletes the record with the given primary key.
             * @param  {object} primaryKey primary key of the record
             * @returns {object} promise
             */
            'delete': function (primaryKey) {
                return $cordovaSQLite.execute(this.dbConnection, this.deleteRecordTemplate, [primaryKey]);
            },
            /**
             * @ngdoc method
             * @name wm.plugins.database.services.$LocalDBStoreFactory.$Store#clear
             * @methodOf wm.plugins.database.services.$LocalDBStoreFactory.$Store
             * @description
             * clears all data of this store.
             * @returns {object} promise
             */
            'clear': function () {
                return $cordovaSQLite.execute(this.dbConnection, 'DELETE FROM ' + escapeName(this.schema.name));
            },
            /**
             * @ngdoc method
             * @name wm.plugins.database.services.$LocalDBStoreFactory.$Store#filter
             * @methodOf wm.plugins.database.services.$LocalDBStoreFactory.$Store
             * @description
             * filters data of this store that statisfy the given filter criteria.
             * @param  {object=} filterCriteria [{"attributeName" : '',
             *                          "filterCondition" : '',
             *                          "attributeValue" : '',
             *                          "attributeType": '' }...]
             * @param  {Array=} sort ex: ['filedname asc/desc',...]
             * @param  {object=} page {'offset' : 0, "limit" : 20}
             * @returns {object} promise that is resolved with the filtered data.
             */
            'filter': function (filterCriteria, sort, page) {
                var schema = this.schema,
                    sql = this.selectSqlTemplate;
                sql += generateWherClause(this, filterCriteria);
                sql += generateOrderByClause(this, sort);
                sql += geneateLimitClause(page);
                return $cordovaSQLite.execute(this.dbConnection, sql).then(function (result) {
                    var objArr = [],
                        rowCount = result.rows.length,
                        i;
                    for (i = 0; i < rowCount; i++) {
                        objArr.push(mapRowDataToObj(schema, result.rows.item(i)));
                    }
                    return objArr;
                });
            }
        });
        /**
         * @ngdoc method
         * @name wm.plugins.database.services.$LocalDBStoreFactory#createStore
         * @methodOf wm.plugins.database.services.$LocalDBStoreFactory
         * @description
         * Creates a store for the given entity schema in the given database.
         *
         * @param {object} dbConnection an database connection created using SQLite api.
         * @param {object} entitySchema schema of the entity
         * @param {boolean} drop if true, existing store will be deleted.
         * @returns {object} a promise that will be resolved with store object
         */
        this.createStore = function (dbConnection, entitySchema, drop) {
            var store = new Store(dbConnection, entitySchema);
            if (drop) {
                return store.drop().then(function () {
                    store.create().then(function () {
                        return store;
                    });
                });
            }
            return store.create().then(function () {
                return store;
            });
        };
    }];