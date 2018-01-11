/*global wm, WM, FileTransfer, _*/
/*jslint sub: true */
/**
 * @ngdoc service
 * @name wm.plugins.database.services.$LocalDBService
 * @description
 * The 'wm.plugins.database.services.$LocalDBService' provides API  to interact with LocalDatabase. This service will
 * override DatabaseService in such a way that all method calls goes through this service. In online, these
 * overridden call invocations reach to the original DatabaseService methods. In offline, these call invocations are
 * handled by LocalDBService.
 */
wm.plugins.database.services.LocalDBService = [
    '$q',
    'DatabaseService',
    'ChangeLogService',
    'LocalDBManager',
    'NetworkService',
    "Utils",
    function ($q, DatabaseService, ChangeLogService, LocalDBManager, NetworkService, Utils) {
        'use strict';

        var self = this,
            supportedOperations = [{
                'name' : 'insertTableData',
                'update' : true
            }, {
                'name' : 'insertMultiPartTableData',
                'update' : true
            }, {
                'name' : 'updateTableData',
                'update' : true
            }, {
                'name' : 'updateMultiPartTableData',
                'update' : true
            }, {
                'name' : 'deleteTableData',
                'update' : true
            }, {
                'name' : 'readTableData',
                'update' : false
            }, {
                'name' : 'searchTableData',
                'update' : false
            }, {
                'name' : 'searchTableDataWithQuery',
                'update' : false
            }];

        function getStore(params) {
            var deferredStore = $q.defer(),
                store = LocalDBManager.getStore(params.dataModelName, params.entityName);
            if (store) {
                deferredStore.resolve(store);
            } else {
                deferredStore.reject("No store is found with name \'" + params.entityName + "\' in database \'"
                    + params.dataModelName + "\'.");
            }
            return deferredStore.promise;

        }

        /*
         * During offline, LocalDBService will answer to all the calls. All data modifications will be recorded
         * and will be reported to DatabaseService when device goes online.
         */
        function localDBcall(operation, params, successCallback, failureCallback) {
            self[operation.name](params, function (response) {
                if (operation.update) {
                    ChangeLogService.add('DatabaseService', operation.name, params).then(function () {
                        Utils.triggerFn(successCallback, response);
                    }, failureCallback);
                } else {
                    Utils.triggerFn(successCallback, response);
                }
            }, failureCallback);
        }

        /*
         * During online, all read operations data will be pushed to offline database. Similarly, Update and Delete
         * operations are synced with the offline database.
         */
        function remoteDBcall(operation, onlineHandler, params, successCallback, failureCallback) {
            onlineHandler.call(DatabaseService, params, function (response) {
                if (!(operation.update  || params.skipLocalDB)) {
                    getStore(params).then(function (store) {
                        store.saveAll(response.content);
                    });
                } else if (operation.name !== 'insertTableData' && operation.name !== 'insertMultiPartTableData') {
                    self[operation.name](params, WM.noop, WM.noop);
                }
                Utils.triggerFn(successCallback, response);
            }, failureCallback);
        }

        /**
         * @ngdoc method
         * @name wm.plugins.database.services.$LocalDBService#handleOfflineDBCalls
         * @methodOf wm.plugins.database.services.$LocalDBService
         * @description
         * DatabaseService calls will be routed through LocalDBService module.
         */
        this.handleOfflineDBCalls = function () {
            _.forEach(supportedOperations, function (operation) {
                var onlineHandler = DatabaseService[operation.name];
                if (onlineHandler) {
                    DatabaseService[operation.name] = function (params, successCallback, failureCallback) {
                        var isBundleData = LocalDBManager.isBundled(params.dataModelName, params.entityName);
                        if (isBundleData || (!NetworkService.isConnected() && !params.onlyOnline)) {
                            if (isBundleData && operation.update) {
                                Utils.triggerFn(failureCallback, "Data modification is not allowed on bundled data.");
                            } else {
                                localDBcall(operation, params, successCallback, function () {
                                    remoteDBcall(operation, onlineHandler, params, successCallback, failureCallback);
                                });
                            }

                        } else {
                            remoteDBcall(operation, onlineHandler, params, successCallback, failureCallback);
                        }
                    };
                }
            });
        };

        /**
         * @ngdoc method
         * @name wm.plugins.database.services.$LocalDBService#insertTableData
         * @methodOf wm.plugins.database.services.$LocalDBService
         * @description
         * Method to insert data into the specified table. This modification will be added to offline change log.
         *
         * @param {object} params
         *                 Object containing name of the project & table data to be inserted.
         * @param {function=} successCallback
         *                    Callback function to be triggered on success.
         * @param {function=} failureCallback
         *                    Callback function to be triggered on failure.
         */
        this.insertTableData = function (params, successCallback, failureCallback) {
            getStore(params).then(function (store) {
                return store.add(params.data).then(function (localId) {
                    if (store.primaryKeyField && store.primaryKeyField.generatorType === 'identity') {
                        params.data[store.primaryKeyName] = localId;
                    }
                    successCallback(params.data);
                });
            }).catch(failureCallback);
        };

        /**
         * @ngdoc method
         * @name wm.plugins.database.services.$LocalDBService#insertMultiPartTableData
         * @methodOf wm.plugins.database.services.$LocalDBService
         * @description
         * Method to insert multi part data into the specified table. This modification will be added to offline change log.
         *
         * @param {object} params
         *                 Object containing name of the project & table data to be inserted.
         * @param {function=} successCallback
         *                    Callback function to be triggered on success.
         * @param {function=} failureCallback
         *                    Callback function to be triggered on failure.
         */
        this.insertMultiPartTableData = function (params, successCallback, failureCallback) {
            var localDBService = this;
            getStore(params).then(function (store) {
                store.serialize(params.data).then(function (data) {
                    params.data = data;
                    localDBService.insertTableData(params, successCallback, failureCallback);
                });
            }).catch(failureCallback);
        };

        /**
         * @ngdoc method
         * @name wm.plugins.database.services.$LocalDBService#updateTableData
         * @methodOf wm.plugins.database.services.$LocalDBService
         *
         * @description
         * Method to update data in the specified table. This modification will be added to offline change log.
         *
         * @param {object} params
         *                 Object containing name of the project & table data to be updated.
         * @param {function=} successCallback
         *                    Callback function to be triggered on success.
         * @param {function=} failureCallback
         *                    Callback function to be triggered on failure.
         */
        this.updateTableData = function (params, successCallback, failureCallback) {
            getStore(params).then(function (store) {
                store.save(params.data).then(function () {
                    successCallback(params.data);
                });
            }).catch(failureCallback);
        };

        /**
         * @ngdoc method
         * @name wm.plugins.database.services.$LocalDBService#updateMultiPartTableData
         * @methodOf wm.plugins.database.services.$LocalDBService
         *
         * @description
         * Method to update multi part data in the specified table. This modification will be added to offline change log.
         *
         * @param {object} params
         *                 Object containing name of the project & table data to be updated.
         * @param {function=} successCallback
         *                    Callback function to be triggered on success.
         * @param {function=} failureCallback
         *                    Callback function to be triggered on failure.
         */

        this.updateMultiPartTableData = function (params, successCallback, failureCallback) {
            var data = (params.data && params.data.rowData) || params.data;
            getStore(params).then(function (store) {
                store.save(data).then(function () {
                    successCallback(data);
                });
            }).catch(failureCallback);
        };

        /**
         * @ngdoc method
         * @name wm.plugins.database.services.$LocalDBService#deleteTableData
         * @methodOf wm.plugins.database.services.$LocalDBService
         *
         * @description
         * Method to delete data in the specified table. This modification will be added to offline change log.
         *
         * @param {object} params
         *                 Object containing name of the project & table data to be inserted.
         * @param {function=} successCallback
         *                    Callback function to be triggered on success.
         * @param {function=} failureCallback
         *                    Callback function to be triggered on failure.
         */
        this.deleteTableData = function (params, successCallback, failureCallback) {
            getStore(params).then(function (store) {
                var pkField = store.primaryKeyField,
                    id = params[pkField.fieldName] || params[pkField.name];
                store.delete(id).then(successCallback);
            }).catch(failureCallback);
        };

        /**
         * @ngdoc method
         * @name wm.plugins.database.services.$LocalDBService#readTableData
         * @methodOf wm.plugins.database.services.$LocalDBService
         *
         * @description
         * Method to read data from a specified table.
         *
         * @param {object} params
         *                 Object containing name of the project & table data to be inserted.
         * @param {function=} successCallback
         *                    Callback function to be triggered on success.
         * @param {function=} failureCallback
         *                    Callback function to be triggered on failure.
         */
        this.readTableData = function (params, successCallback, failureCallback) {
            getStore(params).then(function (store) {
                store.filter(params.filterMeta, params.sort.split('=')[1], {
                    offset: (params.page - 1) * params.size,
                    limit: params.size
                }).then(function (data) {
                    successCallback({
                        'content': data
                    });
                });
            }).catch(failureCallback);
        };

        /**
         * @ngdoc method
         * @name wm.plugins.database.services.$LocalDBService#searchTableData
         * @methodOf wm.plugins.database.services.$LocalDBService
         *
         * @description
         * Method to read data from a specified table.
         *
         * @param {object} params
         *                 Object containing name of the project & table data to be inserted.
         * @param {function=} successCallback
         *                    Callback function to be triggered on success.
         * @param {function=} failureCallback
         *                    Callback function to be triggered on failure.
         */
        this.searchTableData = this.readTableData;

        /**
         * @ngdoc method
         * @name wm.plugins.database.services.$LocalDBService#searchTableDataWithQuery
         * @methodOf wm.plugins.database.services.$LocalDBService
         *
         * @description
         * Method to read data from a specified table.
         *
         * @param {object} params
         *                 Object containing name of the project & table data to be inserted.
         * @param {function=} successCallback
         *                    Callback function to be triggered on success.
         * @param {function=} failureCallback
         *                    Callback function to be triggered on failure.
         */
        this.searchTableDataWithQuery = this.readTableData;
    }];