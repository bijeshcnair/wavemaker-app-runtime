/*global WM, moment, _, confirm*/

/**
 * @ngdoc service
 * @name wm.widgets.live.LiveWidgetUtils
 * @requires Utils
 * The `LiveWidgetUtils` service provides utility methods for Live widgets.
 */
WM.module('wm.widgets.live')
    .service('LiveWidgetUtils', [
        'Utils',
        '$rootScope',
        'FormWidgetUtils',
        'PropertiesFactory',
        '$compile',
        'CONSTANTS',
        'WidgetUtilService',
        'Variables',
        'QueryBuilder',
        'DialogService',

        function (Utils, $rs, FormWidgetUtils, PropertiesFactory, $compile, CONSTANTS, WidgetUtilService, Variables, QueryBuilder, DialogService) {
            'use strict';
            var keyEventsWidgets       = ['number', 'text', 'select', 'password', 'textarea'],
                definedEvents          = ['onBlur', 'onFocus', 'onChange'],
                eventTypes             = definedEvents.concat(['onMouseleave', 'onMouseenter', 'onClick', 'onSelect', 'onSubmit']),
                allEventTypes          = eventTypes.concat('onKeypress', 'onKeydown', 'onKeyup'),
                defaultNgClassesConfig = {'className': '', 'condition': ''},
                isDataSetWidgets       = Utils.getDataSetWidgets();
            /**
             * @ngdoc function
             * @name wm.widgets.live.LiveWidgetUtils#formatBooleanValue
             * @methodOf wm.widgets.live.LiveWidgetUtils
             * @function
             *
             * @description
             * return the formatted boolean value
             *
             * @param {string} value value to be formatted
             */
            function formatBooleanValue(value) {
                if (value === 'true') {
                    return true;
                }
                if (value === 'false') {
                    return false;
                }
                return value;
            }

            /**
             * @ngdoc function
             * @name wm.widgets.live.LiveWidgetUtils#getEventTypes
             * @methodOf wm.widgets.live.LiveWidgetUtils
             * @function
             *
             * @description
             * return event types based on widget type if provided
             *
             * @param {string} widgetType type to the widget
             */
            function getEventTypes(widgetType) {
                if (widgetType) {
                    if (_.includes(keyEventsWidgets, widgetType.toLowerCase())) {
                        return allEventTypes;
                    }
                    return eventTypes;
                }
                return allEventTypes;
            }

            /**
             * @ngdoc function
             * @name wm.widgets.live.LiveWidgetUtils#getDefaultValue
             * @methodOf wm.widgets.live.LiveWidgetUtils
             * @function
             *
             * @description
             * return the formatted default value
             *
             * @param {string} value value to be formatted
             * @param {string} type column type of the value
             */
            function getDefaultValue(value, type, widget) {
                if (_.startsWith(value, 'bind:')) {
                    return value;
                }
                if (widget) {
                    if (widget === 'number' || widget === 'slider' || widget === 'currency') {
                        return isNaN(Number(value)) ? null : Number(value);
                    }
                    if (widget === 'checkbox' || widget === 'toggle') {
                        return formatBooleanValue(value);
                    }
                    return value;
                }
                if (Utils.isNumberType(type)) {
                    return isNaN(Number(value)) ? null : Number(value);
                }
                if (type === 'boolean') {
                    return formatBooleanValue(value);
                }
                return value;
            }

            /**
             * @ngdoc function
             * @name wm.widgets.live.LiveWidgetUtils#getLiveWidgetButtons
             * @methodOf wm.widgets.live.LiveWidgetUtils
             * @function
             *
             * @description
             * return the default button definitions of live form.
             */
            function getLiveWidgetButtons(widgetType) {
                var defaultButtons;
                switch (widgetType) {
                case 'LIVEFORM':
                    defaultButtons = [
                        {
                            key         :    'reset',
                            class       :    'form-reset btn-secondary',
                            iconclass   :    'wi wi-refresh',
                            action      :    'reset()',
                            displayName :    'Reset',
                            show        :    'true',
                            type        :    'button',
                            updateMode  :    true,
                            shortcutkey : ''
                        },
                        {
                            key         :   'cancel',
                            class       :   'form-cancel btn-secondary',
                            iconclass   :   'wi wi-cancel',
                            action      :   'cancel()',
                            displayName :   'Cancel',
                            show        :   'true',
                            type        :   'button',
                            updateMode  :   true,
                            shortcutkey : ''
                        },
                        {
                            key         :   'save',
                            class       :   'form-save btn-success',
                            iconclass   :   $rs.isMobileApplicationType ? 'wi wi-done' : 'wi wi-save',
                            action      :   '',
                            displayName :   'Save',
                            show        :   'true',
                            type        :   'submit',
                            updateMode  :   true,
                            shortcutkey : ''
                        },
                        {
                            key         :   'delete',
                            class       :   'form-delete btn-secondary',
                            iconclass   :   'wi wi-trash',
                            action      :   'delete()',
                            displayName :   'Delete',
                            show        :   'true',
                            type        :   'button',
                            updateMode  :   false,
                            shortcutkey : ''
                        },
                        {
                            key         :   'edit',
                            class       :   'form-update btn-secondary',
                            iconclass   :   'wi wi-pencil',
                            action      :   'edit()',
                            displayName :   'Edit',
                            show        :   'true',
                            type        :   'button',
                            updateMode  :   false,
                            shortcutkey : ''
                        },
                        {
                            key         :   'new',
                            class       :   'form-new btn-success',
                            iconclass   :   'wi wi-plus',
                            action      :   'new()',
                            displayName :   'New',
                            show        :   'true',
                            type        :   'button',
                            updateMode  :   false,
                            shortcutkey : ''
                        }
                    ];
                    break;
                case 'LIVEFILTER':
                    defaultButtons = [
                        {
                            key         :   'filter',
                            class       :   'btn-primary',
                            iconclass   :   'wi wi-filter-list',
                            action      :   'filter()',
                            displayName :   'Filter',
                            show        :   'true',
                            type        :   'button',
                            shortcutkey : ''
                        },
                        {
                            key         :   'clear',
                            class       :   'btn-secondary',
                            iconclass   :   'wi wi-trash',
                            action      :   'clearFilter()',
                            displayName :   'Clear',
                            show        :   'true',
                            type        :   'button',
                            shortcutkey : ''
                        }];
                    break;
                case 'GRID':
                    defaultButtons = [
                        {
                            'key'        : 'addNewRow',
                            'displayName': 'New',
                            'iconclass'  : 'wi wi-plus',
                            'show'       : 'true',
                            'class'      : 'btn-primary',
                            'action'     : 'addNewRow()',
                            'position'   : 'footer',
                            shortcutkey : ''
                        }
                    ];
                    break;
                case 'GRIDROW':
                    defaultButtons = [
                        {
                            'key'        : 'updaterow',
                            'displayName': '',
                            'title'      : 'Edit',
                            'iconclass'  : 'wi wi-pencil',
                            'show'       : 'true',
                            'class'      : 'btn-transparent',
                            'action'     : 'editRow()'
                        },
                        {
                            'key'        : 'deleterow',
                            'displayName': '',
                            'title'      : 'Delete',
                            'iconclass'  : 'wi wi-trash',
                            'show'       : 'true',
                            'class'      : 'btn-transparent',
                            'action'     : 'deleteRow()'
                        }
                    ];
                    break;
                }
                return defaultButtons;
            }
            /**
             * @ngdoc function
             * @name wm.widgets.live.LiveWidgetUtils#getFieldTypeWidgetTypesMap
             * @methodOf wm.widgets.live.LiveWidgetUtils
             * @function
             *
             * @description
             * return the widget types for liveFilter and liveForm .
             */
            function getFieldTypeWidgetTypesMap() {
                var fieldTypeWidgetTypeMap = {
                    'integer'    : ['number', 'text', 'select', 'checkboxset', 'radioset', 'rating', 'slider', 'currency', 'autocomplete', 'chips'],
                    'big_integer': ['number', 'text', 'select', 'checkboxset', 'radioset', 'rating', 'slider', 'currency', 'autocomplete', 'chips'],
                    'short'      : ['number', 'text', 'select', 'checkboxset', 'radioset', 'slider', 'currency', 'autocomplete', 'chips'],
                    'float'      : ['number', 'text', 'select', 'checkboxset', 'radioset', 'slider', 'currency', 'autocomplete', 'chips'],
                    'big_decimal': ['number', 'text', 'select', 'checkboxset', 'radioset', 'slider', 'currency', 'autocomplete', 'chips'],
                    'double'     : ['number', 'text', 'select', 'checkboxset', 'radioset', 'slider', 'currency', 'autocomplete', 'chips'],
                    'long'       : ['number', 'text', 'select', 'checkboxset', 'radioset', 'rating', 'slider', 'currency', 'autocomplete', 'chips'],
                    'byte'       : ['number', 'text', 'select', 'checkboxset', 'radioset', 'slider', 'currency', 'autocomplete', 'chips'],
                    'string'     : ['text', 'number',  'textarea', 'password', 'richtext', 'select', 'checkboxset', 'radioset', 'date', 'time', 'timestamp', 'switch', 'currency', 'autocomplete', 'chips', 'colorpicker'],
                    'character'  : ['text', 'number',  'textarea', 'password', 'richtext', 'select', 'checkboxset', 'radioset', 'switch', 'currency', 'autocomplete', 'chips'],
                    'text'       : ['text', 'number',  'textarea', 'password', 'richtext', 'select', 'checkboxset', 'radioset', 'date', 'time', 'timestamp', 'switch', 'currency', 'autocomplete', 'chips', 'colorpicker'],
                    'date'       : ['date', 'text', 'number', 'select', 'checkboxset', 'radioset', 'autocomplete', 'chips'],
                    'time'       : ['time', 'text', 'number', 'select', 'checkboxset', 'radioset', 'autocomplete', 'chips'],
                    'timestamp'  : ['timestamp', 'text', 'number', 'select', 'checkboxset', 'radioset', 'autocomplete', 'chips'],
                    'datetime'   : ['datetime', 'text', 'select', 'checkboxset', 'radioset', 'autocomplete', 'chips'],
                    'boolean'    : ['checkbox', 'radioset', 'toggle', 'select'],
                    'list'       : ['select', 'radioset', 'checkboxset', 'switch', 'autocomplete', 'chips'],
                    'clob'       : ['text', 'textarea', 'richtext'],
                    'blob'       : ['upload'],
                    'custom'     : ['text', 'number',  'textarea', 'password', 'checkbox', 'slider', 'richtext', 'currency', 'switch', 'select', 'checkboxset', 'radioset', 'date', 'time', 'timestamp', 'rating', 'datetime', 'autocomplete', 'chips', 'colorpicker']
                };
                return fieldTypeWidgetTypeMap;
            }
            /**
             * @ngdoc function
             * @name wm.widgets.live.LiveWidgetUtils#getMatchModeTypesMap
             * @methodOf wm.widgets.live.LiveWidgetUtils
             * @function
             *
             * @description
             * return the match modes based on the data type
             */
            function getMatchModeTypesMap() {
                var matchModeTypesMap = {
                    'integer'    : ['exact', 'notequals', 'lessthan', 'lessthanequal', 'greaterthan', 'greaterthanequal', 'null', 'isnotnull'],
                    'big_integer': ['exact', 'notequals', 'lessthan', 'lessthanequal', 'greaterthan', 'greaterthanequal', 'null', 'isnotnull'],
                    'short'      : ['exact', 'notequals', 'lessthan', 'lessthanequal', 'greaterthan', 'greaterthanequal', 'null', 'isnotnull'],
                    'float'      : ['exact', 'notequals', 'lessthan', 'lessthanequal', 'greaterthan', 'greaterthanequal', 'null', 'isnotnull'],
                    'big_decimal': ['exact', 'notequals', 'lessthan', 'lessthanequal', 'greaterthan', 'greaterthanequal', 'null', 'isnotnull'],
                    'double'     : ['exact', 'notequals', 'lessthan', 'lessthanequal', 'greaterthan', 'greaterthanequal', 'null', 'isnotnull'],
                    'long'       : ['exact', 'notequals', 'lessthan', 'lessthanequal', 'greaterthan', 'greaterthanequal', 'null', 'isnotnull'],
                    'byte'       : ['exact', 'notequals', 'lessthan', 'lessthanequal', 'greaterthan', 'greaterthanequal', 'null', 'isnotnull'],
                    'string'     : ['anywhere', 'start', 'end', 'exact', 'notequals', 'null', 'isnotnull', 'empty', 'isnotempty', 'nullorempty'],
                    'character'  : ['exact', 'notequals', 'null', 'isnotnull', 'empty', 'isnotempty', 'nullorempty'],
                    'text'       : ['anywhere', 'start', 'end', 'exact', 'notequals', 'null', 'isnotnull', 'empty', 'isnotempty', 'nullorempty'],
                    'date'       : ['exact', 'notequals', 'lessthan', 'lessthanequal', 'greaterthan', 'greaterthanequal', 'null', 'isnotnull'],
                    'time'       : ['exact', 'notequals', 'lessthan', 'lessthanequal', 'greaterthan', 'greaterthanequal', 'null', 'isnotnull'],
                    'timestamp'  : ['exact', 'notequals', 'lessthan', 'lessthanequal', 'greaterthan', 'greaterthanequal', 'null', 'isnotnull'],
                    'datetime'   : ['exact', 'notequals', 'lessthan', 'lessthanequal', 'greaterthan', 'greaterthanequal', 'null', 'isnotnull'],
                    'boolean'    : ['exact', 'null', 'isnotnull'],
                    'clob'       : [],
                    'blob'       : []
                };
                return matchModeTypesMap;
            }
            function toBoolean(val, identity) {
                return val === 'false' ? false : (val === 'true' || val === '' || val === identity || val);
            }
            /**
             * @ngdoc function
             * @name wm.widgets.live.LiveWidgetUtils#getColumnDef
             * @methodOf wm.widgets.live.LiveWidgetUtils
             * @function
             *
             * @description
             * return the common properties to liveFilter and liveForm .
             */
            function getColumnDef(attrs) {
                var columnDef    = {},
                    widgetType   = attrs.widget || (attrs.widgetType && attrs.widgetType.toLowerCase()) || getFieldTypeWidgetTypesMap()[attrs.type || 'text'][0],
                    excludeKeys  = ['$attr', '$$element', 'initWidget', 'role', 'wmResizable', 'wmWidgetDrag', 'value'],
                    booleanAttrs = ['readonly', 'multiple', 'required', 'disabled', 'primaryKey'];
                /*Loop through the attrs keys and set it to columndef*/
                _.each(attrs, function (value, key) {
                    if (_.includes(booleanAttrs, key)) {
                        columnDef[key] = toBoolean(value, key);
                        return;
                    }
                    /*Exclude special type of keys*/
                    if (!_.includes(excludeKeys, key)) {
                        columnDef[key] = value;
                    }
                });
                /*Handle special cases properties*/
                columnDef.displayname   = attrs.displayname || attrs.caption;
                columnDef.pcDisplay     = WM.isDefined(attrs.pcDisplay) ? (attrs.pcDisplay === 'true') : true;
                columnDef.mobileDisplay = WM.isDefined(attrs.mobileDisplay) ? (attrs.mobileDisplay === 'true') : true;
                columnDef.type          = attrs.type || 'text';
                columnDef.widget        = widgetType; /*Widget type support for older projects*/
                columnDef.show          = WM.isDefined(attrs.show) ? (attrs.show === 'false' ? false : (attrs.show === 'true' || attrs.show)) : true;
                columnDef.name          = columnDef.name || columnDef.key || columnDef.field;
                return columnDef;
            }
            /**
             * @ngdoc function
             * @name wm.widgets.live.LiveWidgetUtils#getButtonDef
             * @methodOf wm.widgets.live.LiveWidgetUtils
             * @function
             *
             * @description
             * return the common button attributes to liveFilter, liveForm and grid .
             */
            function getButtonDef(attrs) {
                return {
                    'key'           :   attrs.key || attrs.binding,
                    'displayName'   :   attrs.displayName || attrs.label || attrs.caption || '',
                    'show'          :   attrs.show || 'false',
                    'class'         :   attrs.class || '',
                    'iconclass'     :   attrs.iconclass,
                    'title'         :   _.isUndefined(attrs.title) ? (attrs.displayName || '') : attrs.title,
                    'action'        :   attrs.action,
                    'accessroles'   :   attrs.accessroles,
                    'shortcutkey'   :   attrs.shortcutkey,
                    'disabled'      :   attrs.disabled || 'false',
                    'tabindex'      :   attrs.tabindex ? +attrs.tabindex : undefined
                };
            }

            /*Returns step attribute value based on input type*/
            function getStepValue(type) {
                switch (type) {
                case 'text':
                    return '';
                case 'float':
                case 'double':
                case 'big_decimal':
                    return 0.01;
                case 'long':
                case 'integer':
                    return 1;
                default:
                    return undefined;
                }
            }

            function getCaptionByWidget(type, index, isRelated) {
                if (isRelated) {
                    return '{{getDisplayExpr(formFields[' + index + '].value, formFields[' + index + '].displayexpression || formFields[' + index + '].displayfield || formFields[' + index + '].displaylabel)}}';
                }
                if (type === 'password') {
                    return '********';
                }
                var caption = 'formFields[' + index + '].value';
                if (type === 'datetime' || type === 'timestamp') {
                    caption += ' | date:formFields[' + index + '].datepattern || \'yyyy-MM-dd hh:mm:ss a\'';
                } else if (type === 'time') {
                    caption += ' | date:formFields[' + index + '].timepattern ||  \'hh:mm a\'';
                } else if (type === 'date') {
                    caption += ' | date:formFields[' + index + '].datepattern ||  \'yyyy-MM-dd\'';
                } else if (type === 'rating' || type === 'upload') {
                    caption = '';
                }
                return '{{' + caption + '}}';
            }

            function getFormFields(fieldDef) {
                var fields = '',
                    evtTypes,
                    excludeProperties,
                    fieldKeys,
                    formEvents = Utils.getClonedObject(definedEvents);
                if (fieldDef.widget === 'autocomplete') {
                    //For autocomplete, change is triggered using onSubmit event
                    _.pull(formEvents, 'onChange');
                    formEvents.push('onSubmit');
                }
                evtTypes          = _.pull(getEventTypes(), formEvents);
                excludeProperties = formEvents.concat(['caption', 'type', 'show', 'placeholder', 'maxPlaceholder', 'readonly', 'inputtype', 'widgettype', 'dataset', 'key', 'field', 'pcDisplay', 'mobileDisplay', 'generator', 'isRelated', 'displayname', 'primaryKey', 'step', 'widget', 'validationmessage', 'permitted']);
                fieldKeys         = _.pullAll(_.keys(fieldDef), excludeProperties);
                _.forEach(fieldKeys, function (field) {
                    if (!fieldDef[field]) {
                        return;
                    }
                    switch (field) {
                    case 'name':
                        fields += ' name="' + fieldDef[field] + '_formWidget"';
                        break;
                    case 'widgetid':
                        fields += ' widgetid="' + fieldDef.widgetid + '_' + fieldDef.name + '"';
                        break;
                    case 'textAlignment':
                        fields += ' textalign="' + fieldDef[field] + '"';
                        break;
                    case 'ngclass':
                        fields += ' ng-class="' + fieldDef[field] + '"';
                        break;
                    default:
                        if (_.includes(evtTypes, field)) {
                            fields += ' ' + Utils.hyphenate(field) + '="' + fieldDef[field] + '"';
                        } else if (_.isString(fieldDef[field])) {
                            fields += ' ' + field + '="' + fieldDef[field].replace(/"/g, "'") + '"';
                        } else {
                            fields += ' ' + field + '="' + fieldDef[field] + '"';
                        }
                    }
                });
                _.forEach(formEvents, function (evt) {
                    fields += ' ' + Utils.hyphenate(evt) + '="_' + evt + 'Field($event, $scope, newVal, oldVal);' + (fieldDef[evt] || '') + '"';
                });
                return fields;
            }

            function getDataSetFields(fieldDef, index, $el) {
                var template;
                if (fieldDef.widget === 'autocomplete' || fieldDef.widget === 'typeahead') {
                    template = ' datafield="{{formFields[' + index + '].datafield}}" searchkey="{{formFields[' + index + '].searchkey}}" displaylabel="{{formFields[' + index + '].displaylabel}}"';
                } else {
                    template = ' datafield="{{formFields[' + index + '].datafield}}" displayfield="{{formFields[' + index + '].displayfield}}"';
                }
                if (!fieldDef.dataset) {
                    //In studio mode, set default option instead of scopedataset and add representational data indicator
                    if (CONSTANTS.isStudioMode && $el) {
                        template = template + ' dataset="Option 1, Option 2, Option 3" ';
                        $el.attr('data-evaluated-dataset', '');
                    } else {
                        template = template + ' scopedataset="formFields[' + index + '].dataset" dataset="" ';
                    }
                } else {
                    template = template + ' dataset="{{formFields[' + index + '].dataset}}" ';
                }
                return template;
            }
            /*Returns the default template*/
            function getDefaultTemplate(widgetType, fieldDef, index, minPlaceholderDefault, maxPlaceholderDefault, defaultPlaceholder, additionalFields, isCustomWidget) {
                var template = '',
                    widgetName = 'wm-' + widgetType,
                    updateModeCondition = isCustomWidget ? '' : (widgetType === 'richtexteditor' ? 'show = "bind:isUpdateMode"' : 'ng-if="isUpdateMode"'),
                    allowInvalidAttr = fieldDef.widget === 'number' ? ' allowinvalid=true ' : '',
                    readonly = (widgetType !== 'richtexteditor' || fieldDef.readonly ? 'readonly="{{!isUpdateMode || formFields[' + index + '].readonly}}"' : '');
                additionalFields = additionalFields || '';
                if (fieldDef.isRange) {
                    fieldDef.placeholder = fieldDef.displayformat ? '' : (_.isUndefined(fieldDef.placeholder) ? minPlaceholderDefault : fieldDef.placeholder);
                    fieldDef.maxPlaceholder = fieldDef.displayformat ? '' : (_.isUndefined(fieldDef.maxPlaceholder) ? maxPlaceholderDefault : fieldDef.maxPlaceholder);
                    template = template +
                        '<div class="' + ($rs.isMobileApplicationType ? 'col-xs-6' : 'col-sm-6') + '"><' + widgetName + ' ' +  getFormFields(fieldDef, index, widgetType) + ' scopedatavalue="formFields[' + index + '].minValue" placeholder="' + fieldDef.placeholder + '" readonly="{{!isUpdateMode || formFields[' + index + '].readonly}}"' + allowInvalidAttr + updateModeCondition +  additionalFields + '></' +  widgetName + '></div>' +
                        '<div class="' + ($rs.isMobileApplicationType ? 'col-xs-6' : 'col-sm-6') + '"><' + widgetName + ' ' +  getFormFields(fieldDef, index, widgetType) + ' scopedatavalue="formFields[' + index + '].maxValue" placeholder="' + fieldDef.maxPlaceholder + '" readonly="{{!isUpdateMode || formFields[' + index + '].readonly}}"' + allowInvalidAttr + updateModeCondition + additionalFields + '></' +  widgetName + '></div>';
                } else {
                    fieldDef.placeholder = fieldDef.displayformat ? '' : (_.isUndefined(fieldDef.placeholder) ? defaultPlaceholder : fieldDef.placeholder);
                    template = template + '<' + widgetName + ' ' +  getFormFields(fieldDef, index, widgetType) + ' scopedatavalue="formFields[' + index + '].value" placeholder="' + fieldDef.placeholder + '"' + readonly + allowInvalidAttr + updateModeCondition + additionalFields + '></' +  widgetName + '>';
                }
                return template;
            }
            /*Returns datatime/timestamp template*/
            function getDateTimeTemplate(fieldDef, index) {
                return getDefaultTemplate('datetime', fieldDef, index, 'Select Min date time', 'Select Max date time', 'Select date time');
            }

            /*Returns time template*/
            function getTimeTemplate(fieldDef, index) {
                return getDefaultTemplate('time', fieldDef, index, 'Select Min time', 'Select Max time', 'Select time');
            }

            /*Returns date template*/
            function getDateTemplate(fieldDef, index) {
                return getDefaultTemplate('date', fieldDef, index, 'Select Min date', 'Select Max date', 'Select date');
            }

            /*Returns upload template */
            function getFileUploadTemplate(fieldDef, index) {
                var template = '',
                    events   = ['change', 'click', 'focus', 'blur', 'mouseenter', 'mouseleave'],
                    eventTl  = '';
                //Generate the events templates
                _.forEach(events, function (event) {
                    var eventName = 'on' + _.capitalize(event);
                    if (fieldDef[eventName]) {
                        eventTl += ' ng-' + event + '="' + fieldDef[eventName] + '"';
                    }
                });
                if (fieldDef.filetype === 'image') {
                    template = template + '<a class="form-control-static" target="_blank" href="{{formFields[' + index + '].href}}" ng-show="formFields[' + index + '].href"><img style="height:2em" class="wi wi-file" ng-src="{{formFields[' + index + '].href}}"/></a>';
                } else {
                    template = template + '<a class="form-control-static" target="_blank" href="{{formFields[' + index + '].href}}" ng-show="formFields[' + index + '].href"><i class="wi wi-file"></i></a>';
                }
                template = template + '<input wm-valid-file class="app-blob-upload" data-ng-class="{\'file-readonly\': formFields[' + index + '].readonly}" required="{{formFields[' + index + '].required}}" type="file" name="{{formFields[' + index + '].key}}" ng-required="{{formFields[' + index + '].required}}" ' +
                    'ng-readonly="{{formFields[' + index + '].readonly}}" data-ng-show="isUpdateMode" data-ng-model="formFields[' + index + '].value" accept="{{formFields[' + index + '].permitted}}"' + eventTl + '/>';
                return template;
            }

            /*Returns textarea template */
            function getTextareaTemplate(fieldDef, index) {
                return getDefaultTemplate('textarea', fieldDef, index, '', '', 'Enter value');
            }

            /*Returns richtext template */
            function getRichtextTemplate(fieldDef, index) {
                return getDefaultTemplate('richtexteditor', fieldDef, index, '', '', 'Enter value');
            }

            /*Returns slider template */
            function getSliderTemplate(fieldDef, index) {
                var additionalFields,
                    stepVal = fieldDef.step || getStepValue(fieldDef.type);
                additionalFields = stepVal ? ' step="' + stepVal + '" ' : '';
                return getDefaultTemplate('slider', fieldDef, index, '', '', '', additionalFields);
            }

            function getColorPickerTemplate(fieldDef, index) {
                return getDefaultTemplate('colorpicker', fieldDef, index, 'Select Color', 'Select Color', 'Select Color');
            }

            /*Returns chips template */
            function getChipsTemplate(fieldDef, index) {
                var additionalFields = getDataSetFields(fieldDef, index);
                return getDefaultTemplate('chips', fieldDef, index, '', '', 'Type here...', additionalFields);
            }

            /*Returns radioset template */
            function getRadiosetTemplate(fieldDef, index, $el) {
                var additionalFields = getDataSetFields(fieldDef, index, $el);
                return getDefaultTemplate('radioset', fieldDef, index, '', '', '', additionalFields);
            }

            /*Returns checkboxset template */
            function getCheckboxsetTemplate(fieldDef, index, $el) {
                var additionalFields = getDataSetFields(fieldDef, index, $el);
                return getDefaultTemplate('checkboxset', fieldDef, index, '', '', '', additionalFields);
            }

            /*Returns checkbox template */
            function getCheckboxTemplate(fieldDef, index, widgetType) {
                var additionalFields = widgetType === 'toggle' ? 'type="toggle"' : '';
                return getDefaultTemplate('checkbox', fieldDef, index, '', '', '', additionalFields);
            }

            /*Returns select template */
            function getSelectTemplate(fieldDef, index) {
                var additionalFields = getDataSetFields(fieldDef, index);
                return getDefaultTemplate('select', fieldDef, index, 'Select Min value', 'Select Max value', 'Select value', additionalFields);
            }

            /*Returns text template */
            function getTextNumberTemplate(fieldDef, index) {
                var stepVal, additionalFields;
                stepVal = fieldDef.step || getStepValue(fieldDef.type);
                additionalFields = 'type="{{formFields[' + index + '].inputtype}}" ' + (stepVal ? (' step="' + stepVal + '"') : "");
                return getDefaultTemplate('text', fieldDef, index, 'Enter Min value', 'Enter Max value', 'Enter value', additionalFields);
            }

            function getRatingTemplate(fieldDef, index) {
                var additionalFields = ' maxvalue="{{formFields[' + index + '].maxvalue}}" ';
                return getDefaultTemplate('rating', fieldDef, index, '', '', '', additionalFields, true);
            }

            function getSwitchTemplate(fieldDef, index, $el) {
                var additionalFields = getDataSetFields(fieldDef, index, $el);
                return getDefaultTemplate('switch', fieldDef, index, '', '', '', additionalFields);
            }

            function getCurrencyTemplate(fieldDef, index) {
                var additionalFields,
                    stepVal = fieldDef.step || getStepValue(fieldDef.type);
                additionalFields = 'currency="{{formFields[' + index + '].currency}}" ' + stepVal ? ' step="' + stepVal + '" ' : '';
                return getDefaultTemplate('currency', fieldDef, index, 'Enter Min value', 'Enter Max value', 'Enter value', additionalFields);
            }

            function getSearchTemplate(fieldDef, index) {
                var additionalFields = ' type="autocomplete" relatedfield="{{formFields[' + index + '].relatedfield}}"  width="{{formFields[' + index + '].width}}"' +  getDataSetFields(fieldDef, index);
                return getDefaultTemplate('search', fieldDef, index, '', '', 'Search', additionalFields);
            }
            /**
             * @ngdoc function
             * @name wm.widgets.live.LiveWidgetUtils#getHiddenTemplate
             * @methodOf wm.widgets.live.LiveWidgetUtils
             * @function
             *
             * @description
             * returns the hidden template for liveFilter and liveForm.
             */
            function getHiddenTemplate(fieldDef, index) {
                var additionalFields = 'type="hidden" ';
                return getDefaultTemplate('text', fieldDef, index, '', '', '', additionalFields);
            }
            /**
             * @ngdoc function
             * @name wm.widgets.live.LiveWidgetUtils#getTemplate
             * @methodOf wm.widgets.live.LiveWidgetUtils
             * @function
             *
             * @description
             * return template based on widgetType for liveFilter and liveForm.
             */
            function getTemplate(fieldDef, index, captionPosition, $el) {
                var template = '',
                    widgetType,
                    fieldTypeWidgetTypeMap = getFieldTypeWidgetTypesMap(),
                    labelLayout,
                    controlLayout,
                    displayLabel = '';
                captionPosition = captionPosition || 'top';
                //Set 'Readonly field' placeholder for fields which are readonly and contain generated values if the user has not given any placeholder
                if (fieldDef.readonly && fieldDef.generator === 'identity') {
                    fieldDef.placeholder = fieldDef.placeholder || '';
                }

                if (captionPosition === 'top') {
                    if (($rs.selectedViewPort && $rs.selectedViewPort.os === 'android') || !$rs.isMobileApplicationType || Utils.isAndroid()) { //Is android or not a mobile application
                        labelLayout = controlLayout = 'col-xs-12';
                    } else if ($rs.isMobileApplicationType) { //Is a mobile application and not android
                        labelLayout   = 'col-xs-4';
                        controlLayout = 'col-xs-8';
                    }
                } else {
                    labelLayout   = $rs.isMobileApplicationType ? 'col-xs-4' : 'col-sm-3';
                    controlLayout = $rs.isMobileApplicationType ? 'col-xs-8' : 'col-sm-9';
                }
                //Construct the template based on the Widget Type, if widget type is not set refer to the fieldTypeWidgetTypeMap
                widgetType  = fieldDef.widget || fieldTypeWidgetTypeMap[fieldDef.type][0];
                widgetType  = widgetType.toLowerCase();
                if (fieldDef.displayname) { //Add label field, only if displayname is given
                    displayLabel = '<label ng-style="{width: captionsize}" class="app-label control-label formfield-label ' + labelLayout + '" title="{{formFields[' + index + '].displayname}}" ng-class="{\'text-danger\': ngform[\'' + fieldDef.name + '_formWidget\'].$invalid &&  ngform[\'' + fieldDef.name + '_formWidget\'].$touched && isUpdateMode, required: isUpdateMode && formFields[' + index + '].required}">{{formFields[' + index + '].displayname}}</label>';
                } else {
                    controlLayout = $rs.isMobileApplicationType ? 'col-xs-12' : 'col-sm-12';
                }
                //If displayname is bound, set to empty value. This is to prevent bind: showing up in label
                fieldDef.displayname = (CONSTANTS.isRunMode && _.startsWith(fieldDef.displayname, 'bind:')) ? '' : fieldDef.displayname;
                template    = template +
                    '<div class="live-field form-group app-composite-widget clearfix caption-{{captionposition}}" widget="' + widgetType + '" >' + displayLabel +
                    '<div class="' + controlLayout + ' {{formFields[' + index + '].class}}">' +
                    '<label class="form-control-static app-label" ng-show="!isUpdateMode">' + getCaptionByWidget(widgetType, index, fieldDef.isRelated) + '</label>';

                switch (widgetType) {
                case 'number':
                case 'text':
                case 'password':
                    template += getTextNumberTemplate(fieldDef, index);
                    break;
                case 'select':
                    template += getSelectTemplate(fieldDef, index);
                    break;
                case 'checkbox':
                case 'toggle':
                    template += getCheckboxTemplate(fieldDef, index, widgetType);
                    break;
                case 'checkboxset':
                    template += getCheckboxsetTemplate(fieldDef, index, $el);
                    break;
                case 'radioset':
                    template += getRadiosetTemplate(fieldDef, index, $el);
                    break;
                case 'slider':
                    template += getSliderTemplate(fieldDef, index);
                    break;
                case 'colorpicker':
                    template += getColorPickerTemplate(fieldDef, index);
                    break;
                case 'chips':
                    template += getChipsTemplate(fieldDef, index);
                    break;
                case 'richtext':
                    template += getRichtextTemplate(fieldDef, index);
                    break;
                case 'textarea':
                    template += getTextareaTemplate(fieldDef, index);
                    break;
                case 'upload':
                    template += getFileUploadTemplate(fieldDef, index);
                    break;
                case 'date':
                    template += getDateTemplate(fieldDef, index);
                    break;
                case 'time':
                    template += getTimeTemplate(fieldDef, index);
                    break;
                case 'datetime':
                case 'timestamp':
                    template += getDateTimeTemplate(fieldDef, index);
                    break;
                case 'rating':
                    template += getRatingTemplate(fieldDef, index);
                    break;
                case 'switch':
                    template += getSwitchTemplate(fieldDef, index, $el);
                    break;
                case 'currency':
                    template += getCurrencyTemplate(fieldDef, index);
                    break;
                case 'typeahead':
                case 'autocomplete':
                    template += getSearchTemplate(fieldDef, index);
                    break;
                default:
                    template += getDefaultTemplate('text', fieldDef, index, 'Enter Min value', 'Enter Max value', 'Enter value');
                    break;
                }
                template = template + (fieldDef.hint ? '<p class="help-block" ng-if="!(ngform[\'' + fieldDef.name + '_formWidget\'].$invalid &&  ngform[\'' + fieldDef.name + '_formWidget\'].$touched) && isUpdateMode">{{formFields[' + index + '].hint}}</p>' : '');
                template = template + '<p ng-if="ngform[\'' + fieldDef.name + '_formWidget\'].$invalid &&  ngform[\'' + fieldDef.name + '_formWidget\'].$touched && isUpdateMode" class="help-block text-danger">{{formFields[' + index + '].validationmessage}}</p>';
                template = template + '</div></div>';
                return template;
            }

            /**
             * @ngdoc function
             * @name wm.widgets.live.LiveWidgetUtils#translateVariableObject
             * @methodOf wm.widgets.live.LiveWidgetUtils
             * @function
             *
             * @description
             * consumes the raw object received from LiveVariable and returns consumable field objects agains each column.
             *
             * @param {object} rawObject data object received from the LiveVariable
             * @param {object} widget scope Caller Widget scope (optional)
             */
            function translateVariableObject(rawObject, scope) {
                var translatedObj = [],
                    columnArray = rawObject.propertiesMap ? rawObject.propertiesMap.columns : undefined,
                    fieldNames = [],
                    widgetsMap = getFieldTypeWidgetTypesMap();

                if (scope) {
                    scope.propertiesMap = rawObject.propertiesMap;
                    scope.columnArray = scope.propertiesMap.columns;
                    scope.primaryKey = scope.primaryKey || [];
                }
                _.each(columnArray, function (fieldObj) {
                    if (fieldObj.systemInserted || fieldObj.systemUpdated) {
                        return;
                    }
                    var column;
                    if (!_.includes(fieldNames, fieldObj.fieldName) && !fieldObj.readonly) {
                        fieldNames.push(fieldObj.fieldName);
                        column = {
                            'displayname'   : Utils.prettifyLabel(fieldObj.fieldName),
                            'show'          : true,
                            'primaryKey'    : fieldObj.isPrimaryKey,
                            'generator'     : fieldObj.generator,
                            'key'           : fieldObj.fieldName,
                            'value'         : '',
                            'type'          : fieldObj.isRelated ? 'list' : fieldObj.fullyQualifiedType,
                            'maxvalue'      : '',
                            'isRelated'     : fieldObj.isRelated,
                            'readonly'      : fieldObj.isPrimaryKey,
                            'required'      : fieldObj.notNull === 'true' || fieldObj.notNull === true,
                            'pcDisplay'     : true,
                            'mobileDisplay' : true
                        };
                        if (Utils.isNumberType(column.type)) {
                            column.step = fieldObj.scale ? Math.pow(10, fieldObj.scale * -1) : 0;
                        }
                        column.widget = widgetsMap[column.type || 'custom'][0];
                        if (fieldObj.defaultValue) {
                            column.defaultvalue = getDefaultValue(fieldObj.defaultValue, fieldObj.type);
                        }
                        if (fieldObj.type === 'string' || fieldObj.type === 'character' || fieldObj.type === 'text' || fieldObj.type === 'blob' || fieldObj.type === 'clob') {
                            column.maxchars = fieldObj.length;
                        }
                        if (fieldObj.isPrimaryKey) {
                            /*If the field has assigned generator, make read only false*/
                            if (fieldObj.generator === 'assigned') {
                                column.readonly = false;
                            } else {
                                /*Hiding primary if it is generated automatically(User can un-hide it from edit feilds dialog)*/
                                column.show = false;
                            }
                        }
                        translatedObj.push(column);
                    }
                });
                return translatedObj;
            }

            /**
             * @ngdoc function
             * @name wm.widgets.live.LiveWidgetUtils#getColumnCountByLayoutType
             * @methodOf wm.widgets.live.LiveWidgetUtils
             * @function
             *
             * @description
             * returns the number of columns based on the provided layout type. E.g. 1 for "One Column", 2 for "Two Column", etc.
             *
             * @param {object} layout layout type
             */
            function getColumnCountByLayoutType(layout, numOfColumns) {
                if (layout) {
                    var layoutObj = {
                        'One Column'   : 1,
                        'Two Column'   : 2,
                        'Three Column' : 3,
                        'Four Column'  : 4
                    };
                    return layoutObj[layout] || 1;
                }
                return numOfColumns || 1;
            }

            /**
             * @ngdoc function
             * @name wm.widgets.live.LiveWidgetUtils#getCustomFieldKey
             * @methodOf wm.widgets.live.LiveWidgetUtils
             * @function
             *
             * @description
             * returns the auto incremented event string based on the already existing events
             *
             * @param {object} fields array of the columns/ buttons
             * @param {string} key key where the field name is stored in object
             * @param {string} prefix name for the event/ action
             */
            function getCustomFieldKey(fields, key, prefix, definedKeys) {
                var keys = definedKeys || fields.map(function (event) {
                    return event[key];
                }), index;
                if (keys && _.includes(keys, prefix)) {
                    index = 1;
                    while (_.includes(keys, prefix + index)) {
                        index += 1;
                    }
                    prefix = prefix + index;
                }
                return prefix;
            }
            /**
             * @ngdoc function
             * @name wm.widgets.live.LiveWidgetUtils#splitDimension
             * @methodOf wm.widgets.live.LiveWidgetUtils
             * @function
             *
             * @description
             * extracts value and unit from the given width or height
             *
             * @param {object} column column pr field definition
             * @param {string} type width or height
             */
            function splitDimension(column, type) {
                var value,
                    unit,
                    width,
                    height,
                    getValue = function (val) {
                        val =  parseInt(val, 10);
                        return isNaN(val) ? '' : val;
                    };
                switch (type) {
                case 'width':
                    /*extract the width and width unit from width*/
                    width = column.width || '';
                    value = getValue(width);
                    unit = width.indexOf('%') === -1 ? 'px' : '%';

                    column.widthValue = value;
                    column.widthUnit = unit;
                    break;
                case 'height':
                    /*extract the width and width unit from width*/
                    height = column.height || '';
                    value = getValue(height);
                    unit = height.indexOf('%') === -1 ? 'px' : '%';

                    column.heightValue = value;
                    column.heightUnit = unit;
                    break;
                }
            }
            /**
             * @ngdoc function
             * @name wm.widgets.live.LiveWidgetUtils#mergeDimension
             * @methodOf wm.widgets.live.LiveWidgetUtils
             * @function
             *
             * @description
             * sets width or height from the value and unit
             *
             * @param {object} column column or field definition
             * @param {string} type width or height
             */
            function mergeDimension(column, type) {
                /*if width is given and a number set it*/
                switch (type) {
                case 'width':
                    if (WM.isDefined(column.widthValue) && column.widthValue !== '' && !isNaN(column.widthValue)) {
                        column.width = column.widthValue + column.widthUnit;
                    } else if (!column.widthValue || (!column.widthValue.length && Utils.stringStartsWith(column.width, column.widthValue))) {
                        /* Reset the width to default value when the widthValue is cleared from the UI. */
                        column.width = undefined;
                    }
                    column.widthValue = undefined;
                    column.widthUnit = undefined;
                    break;
                case 'height':
                    if (WM.isDefined(column.heightValue) && column.heightValue !== '' && !isNaN(column.heightValue)) {
                        column.height = column.heightValue + column.heightUnit;
                    } else if (!column.heightValue || (!column.heightValue.length && Utils.stringStartsWith(column.width, column.heightValue))) {
                        /* Reset the height to default value when the heightValue is cleared from the UI. */
                        column.height = undefined;
                    }
                    column.heightValue = undefined;
                    column.heightUnit = undefined;
                    break;
                }
            }
            /**
             * @ngdoc function
             * @name wm.widgets.live.LiveWidgetUtils#fieldPropertyChangeHandler
             * @methodOf wm.widgets.live.LiveWidgetUtils
             * @function
             *
             * @description
             * Define the property change handler for form and filter. This function will be triggered when there is a change in the widget property
             *
             * @param {object} scope scope of the field
             * @param {object} element element of the field
             * @param {object} attrs attributes of the field
             * @param {string} key key which value is changed
             * @param {string} newVal new value for the key
             */
            function fieldPropertyChangeHandler(scope, element, attrs, parentScope, index, key, newVal) {
                var template       = '',
                    wdgtProperties = scope.widgetProps,
                    formWidget     = parentScope.Widgets[scope.name + '_formWidget'];

                function compileField() {
                    if (CONSTANTS.isRunMode) {
                        //On changing of a property in studio mode, generate the template again so that change is reflected
                        template = getTemplate(parentScope.formFields[index], index, parentScope.captionposition);
                        //Destroy the scopes of the widgtes inside the form field
                        element.find('.ng-isolate-scope')
                            .each(function () {
                                var elIscope = WM.element(this).isolateScope();
                                if (elIscope) {
                                    elIscope.$destroy();
                                }
                            });
                        //Remove only live-field so that overlay won't get overrided
                        element.find('.live-field').remove();
                        element.append(template);
                        $compile(element.contents())(parentScope);
                    }
                }

                function setFormField() {
                    if (CONSTANTS.isRunMode) {
                        parentScope.formFields[index][key] = newVal;
                    }
                }

                if (formWidget && key !== 'show') {
                    formWidget[key] = newVal; //Set the property on the form widget inside the form field widget
                }
                switch (key) {
                case 'dataset':
                    /*if studio-mode, then update the displayField & dataField in property panel for dataset widgets*/
                    if (scope.widgetid && isDataSetWidgets[attrs.widget] && WM.isDefined(newVal) && newVal !== null) {
                        if (newVal === '') {
                            scope.$root.$emit('set-markup-attr', scope.widgetid, {'datafield': '', 'searchkey': '', 'displaylabel': '', 'displayfield': ''});
                        }
                        WidgetUtilService.updatePropertyPanelOptions(scope);
                        if (scope.widget === 'autocomplete') {
                            FormWidgetUtils.updatePropertyOptionsWithParams(scope); //update searchkey options in case of service variables
                        }
                        element.removeAttr('data-evaluated-dataset');
                    }
                    break;
                case 'inputtype':
                    FormWidgetUtils.setPropertiesTextWidget(wdgtProperties, newVal);
                    break;
                case 'show':
                    if (CONSTANTS.isStudioMode && newVal) {
                        Utils.getService('LiveWidgetsMarkupManager').updateFieldMarkup({'formName': parentScope.name, 'fieldName': scope.name});
                        element.parents('[widgettype="wm-gridcolumn"]').removeClass('hide');
                    }
                    setFormField();
                    compileField();
                    break;
                case 'displayname':
                    element.find('label.formfield-label').attr('title', newVal).text(newVal);
                    setFormField();
                    break;
                case 'disabled':
                case 'readonly':
                case 'required':
                case 'validationmessage':
                case 'hint':
                    setFormField();
                    break;
                case 'active':
                    if (scope.widget === 'number' || scope.widget === 'password' || scope.widget === 'text') {
                        FormWidgetUtils.setPropertiesTextWidget(wdgtProperties, scope.inputtype);
                    }
                    break;
                }
            }
            /**
             * @ngdoc function
             * @name wm.widgets.live.LiveWidgetUtils#getWidgetProps
             * @methodOf wm.widgets.live.LiveWidgetUtils
             * @function
             *
             * @description
             * Get the respective widget properties for the widget
             *
             * @param {string} widgetType type of the widget
             */
            function getWidgetProps(widgetType, fieldType) {
                var widgetProps,
                    baseProperties,
                    extendedProperties,
                    textWidgets = ['text', 'number', 'password'],
                    setDefaultValueProps = function () {
                        var defaultProp;
                        /*Use default value instead of datavalue for fields*/
                        if (widgetType === 'radioset') {
                            defaultProp = 'selectedvalue';
                        } else if (widgetType === 'checkboxset') {
                            defaultProp = 'selectedvalues';
                        } else if (widgetType === 'switch') {
                            defaultProp = 'defaultvalue';
                        } else {
                            defaultProp = 'datavalue';
                        }
                        if (widgetProps[defaultProp]) {
                            widgetProps.defaultvalue      = WM.copy(widgetProps[defaultProp]);
                            widgetProps[defaultProp].show = false;
                        }
                        //Ignore the default getter setter on datavalue as it is set explicitly for form field
                        _.set(widgetProps.datavalue, 'ignoreGetterSetters', true);
                    };
                widgetType = widgetType.toLowerCase();
                switch (widgetType) {
                case 'textarea':
                    baseProperties      = 'wm.textarea';
                    extendedProperties  = ['wm.base', 'wm.base.editors', 'wm.base.editors.abstracteditors', 'wm.base.events.keyboard'];
                    break;
                case 'toggle':
                case 'checkbox':
                    baseProperties      = 'wm.checkbox';
                    extendedProperties  = ['wm.base', 'wm.base.editors.abstracteditors'];
                    break;
                case 'slider':
                    baseProperties      = 'wm.slider';
                    extendedProperties  = ['wm.base', 'wm.base.events.change'];
                    break;
                case 'colorpicker':
                    baseProperties      = 'wm.colorpicker';
                    extendedProperties  = ['wm.base', 'wm.base.events', 'wm.base.events.focus', 'wm.base.events.change'];
                    break;
                case 'chips':
                    baseProperties      = 'wm.chips';
                    extendedProperties  = ['wm.base', 'wm.base.editors.dataseteditors'];
                    break;
                case 'richtext':
                    baseProperties      = 'wm.richtexteditor';
                    extendedProperties  = ['wm.base'];
                    break;
                case 'select':
                    baseProperties      = 'wm.select';
                    extendedProperties  = ['wm.base', 'wm.base.editors', 'wm.base.editors.abstracteditors', 'wm.base.editors.dataseteditors', 'wm.base.events.keyboard'];
                    break;
                case 'checkboxset':
                    baseProperties      = 'wm.checkboxset';
                    extendedProperties  = ['wm.base', 'wm.base.editors.dataseteditors'];
                    break;
                case 'radioset':
                    baseProperties      = 'wm.radioset';
                    extendedProperties  = ['wm.base', 'wm.base.editors.dataseteditors'];
                    break;
                case 'date':
                    baseProperties      = 'wm.date';
                    extendedProperties  = ['wm.base', 'wm.base.editors.abstracteditors', 'wm.base.datetime'];
                    break;
                case 'time':
                    baseProperties      = 'wm.time';
                    extendedProperties  = ['wm.base', 'wm.base.editors.abstracteditors', 'wm.base.datetime'];
                    break;
                case 'datetime':
                case 'timestamp':
                    baseProperties      = 'wm.datetime';
                    extendedProperties  = ['wm.base', 'wm.base.editors.abstracteditors', 'wm.base.datetime'];
                    break;
                case 'rating':
                    baseProperties      = 'wm.rating';
                    extendedProperties  = ['wm.base', 'wm.base.editors'];
                    break;
                case 'upload':
                    baseProperties      = '';
                    extendedProperties  = ['wm.base', 'wm.base.editors', 'wm.base.editors.abstracteditors'];
                    break;
                case 'switch':
                    baseProperties      = 'wm.switch';
                    extendedProperties  = ['wm.base', 'wm.base.editors.abstracteditors'];
                    break;
                case 'currency':
                    baseProperties      = 'wm.currency';
                    extendedProperties  = ['wm.base', 'wm.base.editors', 'wm.base.editors.abstracteditors'];
                    break;
                case 'typeahead':
                case 'autocomplete':
                    baseProperties      = 'wm.search';
                    extendedProperties  = ['wm.base', 'wm.base.editors.abstracteditors'];
                    break;
                default:
                    baseProperties      = 'wm.text';
                    extendedProperties  = ['wm.base', 'wm.base.editors', 'wm.base.editors.abstracteditors', 'wm.base.events.keyboard'];
                    break;
                }
                widgetProps                   = PropertiesFactory.getPropertiesOf(baseProperties, extendedProperties);
                widgetProps.displayname       =  {'type': "string", 'show': true, 'bindable': "in-bound"};
                widgetProps.widget            = {'type': 'label', 'show': true};
                if (fieldType === 'wm-form-field') {
                    widgetProps.validationmessage      =  {'type': "string", 'bindable': "in-bound"};
                    widgetProps.validationmessage.show = widgetProps.required && widgetProps.required.show;
                }
                if (_.includes(textWidgets, widgetType)) {
                    /*In form and filter, type conflicts with data type. Change the type to input type.*/
                    widgetProps.inputtype = WM.copy(widgetProps.type);
                    delete widgetProps.type;
                } else if (isDataSetWidgets[widgetType]) {
                    widgetProps.dataset.value   = '';
                    widgetProps.datafield.value = '';
                    _.set(widgetProps.displayvalue, 'ignoreGetterSetters', true);
                    if (widgetType === 'autocomplete') {
                        widgetProps.type.show = false;
                    }
                } else if (widgetType === 'upload') {
                    widgetProps = WM.extend(widgetProps, {
                        'readonly'   : {'type': 'boolean', 'bindable': 'in-bound', 'show': true},
                        'filetype'   : {'type': 'data-list', 'options': ['image', 'audio', 'video'], 'show': true},
                        'extensions' : {'type': 'string', 'show': true},
                        'onTap'      : {'show': false}
                    });
                }
                setDefaultValueProps();
                /*No support for scopedatavalue and scopedataset for fields yet*/
                if (widgetProps.scopedatavalue) {
                    delete widgetProps.scopedatavalue;
                }
                if (widgetProps.scopedataset) {
                    delete widgetProps.scopedataset;
                }
                return widgetProps;
            }
            /**
             * @ngdoc function
             * @name wm.widgets.live.LiveWidgetUtils#handleBackwardCompatibility
             * @methodOf wm.widgets.live.LiveWidgetUtils
             * @function
             *
             * @description
             * handle the backward compatibility for some of the field attributes
             *
             * @param {string} fieldType filter field/ form field
             * @param {object} scope scope of the widget
             * @param {object} attrs attributes of the widget
             * @param {string} tElement template of the field
             */
            function handleBackwardCompatibility(fieldType, scope, attrs, tElement) {
                var changeAttr = function (newAttr, oldAttr) {
                    /*Function to change the attribute names*/
                    scope[newAttr] = attrs[newAttr] = attrs[oldAttr];
                    WM.element(tElement.context).attr(newAttr, scope[newAttr]);
                    delete attrs[oldAttr];
                };
                /*Support for old projects*/
                if (!attrs.defaultvalue && attrs.defaultValue) {
                    changeAttr('defaultvalue', 'defaultValue');
                }
                if (!attrs.displayname && attrs.displayName) {
                    changeAttr('displayname', 'displayName');
                }
                if (!attrs.maxchars && attrs.maxvalue && (attrs.inputtype === 'text' || attrs.inputtype === 'password' || attrs.widget === 'textarea')) {
                    changeAttr('maxchars', 'maxvalue');
                }
                if (attrs.widget === 'date' || attrs.widget === 'datetime') {
                    if (attrs.minvalue) {
                        changeAttr('mindate', 'minvalue');
                    }
                    if (attrs.maxvalue) {
                        changeAttr('maxdate', 'maxvalue');
                    }
                }
                if (attrs.minPlaceholder && !attrs.placeholder && fieldType === 'wm-filter-field') {
                    changeAttr('placeholder', 'minPlaceholder');
                }
                if (!attrs.displayexpression && attrs.displayvalue) {
                    changeAttr('displayexpression', 'displayvalue');
                }
            }
            /**
             * @ngdoc function
             * @name wm.widgets.live.LiveWidgetUtils#preProcessFields
             * @methodOf wm.widgets.live.LiveWidgetUtils
             * @function
             *
             * @description
             * Get the respective widget properties for the widget
             *
             * @param {string} fieldType filter field/ form field
             * @param {object} scope scope of the widget
             * @param {object} attrs attributes of the widget
             * @param {string} tElement template of the field
             */
            function preProcessFields(fieldType, scope, attrs, tElement) {
                var inputtype;
                scope.widgettype = fieldType;
                attrs.widget = attrs.widget || (attrs.widgetType && attrs.widgetType.toLowerCase()) || getFieldTypeWidgetTypesMap()[attrs.type || 'text'][0];
                /*Support for older projects, in which widget type was not stored*/
                scope.widget = attrs.widget;
                WM.element(tElement.context).attr('widget', scope.widget);
                /*Based on the widget, get the input types*/
                if (attrs.widget === 'text') {
                    inputtype = attrs.inputtype || 'text';
                } else if (attrs.widget === 'number') {
                    inputtype = 'number';
                } else if (attrs.widget === 'password') {
                    inputtype = 'password';
                }
                scope.inputtype = attrs.inputtype = inputtype;
                WM.element(tElement.context).attr('inputtype', inputtype);
                handleBackwardCompatibility(fieldType, scope, attrs, tElement);
               /*Get the respective widget properties*/
                scope.widgetProps = getWidgetProps(attrs.widget, fieldType);
            }

            function parseNgClasses(classExpression) {
                var ngClasses = [],
                    conditionalClasses;
                defaultNgClassesConfig = {'className': '', 'condition': ''};
                /* Return default config. */
                if (!classExpression) {
                    ngClasses.push(WM.copy(defaultNgClassesConfig));
                    return ngClasses;
                }
                /* Remove curly brackets and get each expression. */
                conditionalClasses = classExpression.substring(1, classExpression.length - 1).split(',');
                /* Generate the config. */
                _.each(conditionalClasses, function (conditionalClassConfig) {
                    var conditionalExpression = conditionalClassConfig.split(':'),
                        className = conditionalExpression[0].trim(),
                        classCondition = conditionalExpression[1].trim(),
                        classNameLen = className.length,
                        config = WM.copy(defaultNgClassesConfig);
                    /* Strip the single quotes from className. */
                    if (className[0] === "'" && className[classNameLen - 1] === "'") {
                        className = className.substring(1, classNameLen - 1);
                    }
                    config.className = className;
                    config.condition = classCondition;
                    ngClasses.push(config);
                });
                return ngClasses;
            }

            function generateNgClassExpression(conditionalClasses) {
                var ngClassExpression = '';
                _.each(conditionalClasses, function (config) {
                    if (config.className && config.condition) {
                        if (ngClassExpression.length) {
                            ngClassExpression += ', ';
                        }
                        ngClassExpression += "'" + config.className + "':" + config.condition;
                    }
                });
                return ngClassExpression.length ? '{' + ngClassExpression + '}' : ngClassExpression;
            }

            function setColumnCustomExpression(column) {
                var widgetNgClassesExpression = generateNgClassExpression(column.widgetConfig.ngClasses);
                switch (column.widgetType) {
                case 'image':
                    if (column.type === 'blob') {
                        column.widgetConfig.src = "{{contentBaseUrl + row[primaryKey] + \'/content/\'+ colDef.field}}";
                        column.customExpression = '<img ng-if="columnValue != null" width="48px" class="" data-ng-src="' + column.widgetConfig.src + '"/>';
                    } else {
                        column.customExpression = '<wm-picture picturesource="' + column.widgetConfig.src + '" hint="' + column.widgetConfig.src + '"' +
                            ' class="' + column.widgetConfig.class + '" data-ng-class="' + widgetNgClassesExpression + '"></wm-picture>';
                    }
                    break;
                case 'button':
                    column.customExpression = '<wm-button caption="' + column.widgetConfig.title + '" show="true" class="' + column.widgetConfig.class + '" iconclass="' +
                        column.widgetConfig.icon + '" on-click="' + column.widgetConfig.action + '" data-ng-class="' + widgetNgClassesExpression + '"></wm-button>';
                    break;
                case 'checkbox':
                    column.customExpression = '<wm-checkbox scopedatavalue="' + column.widgetConfig.model + '" disabled="' + column.widgetConfig.disabled + '" ' +
                        'class = "' + column.widgetConfig.class + '" data-ng-class="' + widgetNgClassesExpression + '"></wm-checkbox>';
                    break;
                case 'anchor':
                    column.customExpression = '<wm-anchor caption="' + column.widgetConfig.title + '" hyperlink="' + column.widgetConfig.hyperlink + '" ' +
                        'class = "' + column.widgetConfig.class + '" data-ng-class="' + widgetNgClassesExpression + '"></wm-anchor>';
                    break;
                case 'label':
                    column.customExpression = '<wm-label caption="' + column.widgetConfig.title + '" ' +
                        'class = "' + column.widgetConfig.class + '" data-ng-class="' + widgetNgClassesExpression + '"></wm-label>';
                    break;
                case 'icon':
                    column.customExpression = '<wm-icon caption="' + column.widgetConfig.title + '" iconclass="' + column.widgetConfig.icon + '" iconposition="' + column.widgetConfig.iconposition + '" ' +
                        'class = "' + column.widgetConfig.class + '" data-ng-class="' + widgetNgClassesExpression + '"></wm-icon>';
                    break;
                default:
                    if (column.type === 'blob') {
                        column.customExpression = '<a data-ng-if="columnValue != null" class="col-md-9" target="_blank" data-ng-href="{{contentBaseUrl + row[primaryKey] + \'/content/\'+ colDef.field}}"><i class="wm-icon wm-icon24 wi wi-file"></i></a>';
                    }
                }
            }

            function setDefaultWidgetConfig(column) {
                var widgetType = column.widgetType,
                    field = column.field,
                    val = column.widgetType === 'button' ? "{{row.getProperty('" + field + "') || 'Button'}}" : "{{row.getProperty('" + field + "')}}",
                    defaultModel = "row['" + field + "']",
                    widgetNgClasses = [Utils.getClonedObject(defaultNgClassesConfig)];
                /* Not storing widget config, it is only on for UI display. Only customExpression will be saved. */
                column.widgetConfig = {};
                switch (widgetType) {
                case 'image':
                    column.widgetConfig = {
                        'src': val,
                        'class': '',
                        'ngClasses': widgetNgClasses
                    };
                    break;
                case 'button':
                    column.widgetConfig = {
                        'icon': '',
                        'action': '',
                        'title': val,
                        'class': 'btn-sm btn-primary',
                        'ngClasses': widgetNgClasses
                    };
                    break;
                case 'checkbox':
                    column.widgetConfig = {
                        'model': defaultModel,
                        'disabled': '{{colDef.readonly || !isGridEditMode}}',
                        'class': '',
                        'ngClasses': widgetNgClasses
                    };
                    break;
                case 'anchor':
                    column.widgetConfig = {
                        'title'    : val,
                        'hyperlink': '',
                        'class'    : '',
                        'ngClasses': widgetNgClasses
                    };
                    break;
                case 'label':
                    column.widgetConfig = {
                        'title'    : val,
                        'class'    : '',
                        'ngClasses': widgetNgClasses
                    };
                    break;
                case 'icon':
                    column.widgetConfig = {
                        'title'        : val,
                        'class'        : '',
                        'icon'         : 'wi wi-star-border',
                        'iconposition' : 'left',
                        'ngClasses'    : widgetNgClasses
                    };
                    break;
                default:
                    column.widgetConfig = {
                        'src': val,
                        'class': '',
                        'ngClasses': widgetNgClasses
                    };
                    break;
                }
            }

            function extractWidgetConfig(column) {
                var customExpression = column.customExpression,
                    widgetType = column.widgetType,
                    widgetDisabled,
                    widgetAction,
                    widgetIcon,
                    widgetTitle,
                    widgetClass,
                    widgetNgClasses,
                    widgetSrc,
                    widgetModel,
                    widgetHyperlink,
                    el;
                column.widgetConfig = {};
                /* If custom expression does not contain any HTML tags, append span. */
                if (!Utils.isValidHtml(customExpression)) {
                    customExpression = '<span>' + customExpression + '</span>';
                }
                el = WM.element(customExpression);
                widgetClass = el.attr('widget-class') || el.attr('class');
                widgetNgClasses = parseNgClasses(el.attr('data-ng-class'));
                switch (widgetType) {
                case 'image':
                    widgetSrc = el.attr('data-ng-src') || el.attr('picturesource');
                    column.widgetConfig = {
                        'src': widgetSrc,
                        'class': widgetClass,
                        'ngClasses': widgetNgClasses
                    };
                    break;
                case 'button':
                    widgetIcon   = el.attr('iconclass') || el.attr('iconname');
                    widgetTitle  = el.attr('caption');
                    widgetAction = el.attr('on-click');
                    column.widgetConfig = {
                        'icon'      : widgetIcon,
                        'action'    : widgetAction,
                        'title'     : widgetTitle,
                        'class'     : widgetClass,
                        'ngClasses' : widgetNgClasses
                    };
                    break;
                case 'checkbox':
                    widgetModel    = el.attr('ng-model') || el.attr('scopedatavalue');
                    widgetDisabled = el.attr('ng-disabled') || el.get(0).getAttribute('disabled');
                    column.widgetConfig = {
                        'model'     : widgetModel,
                        'disabled'  : widgetDisabled,
                        'class'     : widgetClass,
                        'ngClasses' : widgetNgClasses
                    };
                    break;
                case 'anchor':
                    widgetTitle     = el.attr('caption');
                    widgetHyperlink = el.attr('hyperlink');
                    column.widgetConfig = {
                        'title'     : widgetTitle,
                        'hyperlink' : widgetHyperlink,
                        'class'     : widgetClass,
                        'ngClasses' : widgetNgClasses
                    };
                    break;
                case 'label':
                    widgetTitle  = el.attr('caption');
                    column.widgetConfig = {
                        'title'     : widgetTitle,
                        'class'     : widgetClass,
                        'ngClasses' : widgetNgClasses
                    };
                    break;
                case 'icon':
                    widgetTitle  = el.attr('caption');
                    widgetIcon   = el.attr('iconclass');
                    column.widgetConfig = {
                        'title'        : widgetTitle,
                        'icon'         : widgetIcon,
                        'class'        : widgetClass,
                        'iconposition' : el.attr('iconposition') || 'left',
                        'ngClasses'    : widgetNgClasses
                    };
                    break;
                default:
                    column.widgetConfig = {
                        'src'       : '',
                        'class'     : widgetClass,
                        'ngClasses' : widgetNgClasses
                    };
                    break;
                }
            }
            /**
             * @ngdoc function
             * @name wm.widgets.live.LiveWidgetUtils#setColumnConfig
             * @methodOf wm.widgets.live.LiveWidgetUtils
             * @function
             *
             * @description
             * Sets the column config for the selected field
             *
             * @param {object} column for which config needs to be set
             */
            function setColumnConfig(column) {
                /* Not storing ngClasses, it is only on for UI display. Only ngClass expression will be saved. */
                column.ngClasses = parseNgClasses(column.ngclass);
                if (!column.customExpression) {
                    setDefaultWidgetConfig(column);
                    setColumnCustomExpression(column);
                } else {
                    extractWidgetConfig(column);
                }
            }
            /**
             * @ngdoc function
             * @name wm.widgets.live.LiveWidgetUtils#fetchPropertiesMapColumns
             * @methodOf wm.widgets.live.LiveWidgetUtils
             * @function
             *
             * @description
             * Returns columns and sets related data for provided propertiesMap
             *
             * @param {object} propertiesMap from which columns are retrieved
             * @param {object} relatedData for live filter dataset
             * @param {object} variableObj to which filter is binded
             *
             */
            function fetchPropertiesMapColumns(propertiesMap, bindDataSet) {
                var columns = {}, columnName, data = {}, primaryKey, typeUtils = Utils.getService('TypeUtils');
                /* iterated trough the propertiesMap columns of all levels and build object with columns having required configuration*/
                _.forEach(propertiesMap.columns, function (val) {
                    /* if the object is nested type repeat the above process for that nested object through recursively */
                    if (val.isRelated) {
                        if (val.isList) {
                            return;
                        }
                        data.relatedData = data.relatedData || {};
                        var relatedTableColumns = typeUtils.getFieldsForExpr(bindDataSet + '.' + val.fieldName),
                            columnNameTypeMap = {};
                        _.each(val.columns, function (column) {
                            if (column.isPrimaryKey) {
                                primaryKey = column.fieldName;
                            }
                            columnNameTypeMap[column.fieldName] = column.type;
                        });
                        data.relatedData[val.relatedEntityName] = {
                            columns: relatedTableColumns,
                            primaryKey: primaryKey,
                            columnNameTypeMap: columnNameTypeMap
                        };

                        /* otherwise build object with required configuration */
                        columnName = val.fieldName.charAt(0).toLowerCase() + val.fieldName.slice(1);
                        columns[columnName] = {};
                        columns[columnName].isRelated = val.isRelated === 'true' || val.isRelated === true;
                        columns[columnName].relatedEntityName = val.relatedEntityName;
                        columns[columnName].relatedPrimaryKey = primaryKey;
                    } else {
                        /* otherwise build object with required configuration */
                        columnName = val.fieldName;
                        columns[columnName] = {};
                    }
                    columns[columnName].type = val.type;
                    columns[columnName].isPrimaryKey = val.isPrimaryKey;
                    columns[columnName].generator = val.generator;
                });
                return {
                    'columns'     : columns,
                    'relatedData' : data.relatedData
                };
            }

            function fetchReferenceDetails($scope, elScope) {
                var referenceWidget,
                    referenceBindDataSet,
                    referenceVariableName,
                    relatedFieldName,
                    relatedFieldType,
                    fields,
                    details,
                    referenceVariable,
                    widgetName,
                    bindDataSetSplit,
                    bindDataSet                 = $scope.binddataset,
                    widgetRegEx                 =  /Widgets./g,
                    WidgetScopes                = elScope ? elScope.Widgets : $scope.Widgets,
                    isBoundToSelectedItemSubset = bindDataSet.indexOf('selecteditem.') !== -1;
                //Get the reference widget name. As widget can be inner widget (like Widgets.tab.Widgets.grid), find the last inner widget
                while (widgetRegEx.exec(bindDataSet) !== null) {
                    bindDataSetSplit =  _.split(bindDataSet.substr(widgetRegEx.lastIndex, bindDataSet.length), '.');
                    widgetName       = _.head(bindDataSetSplit);
                    relatedFieldName = isBoundToSelectedItemSubset && _.last(bindDataSetSplit);
                    referenceWidget  = _.get(WidgetScopes, widgetName);
                    WidgetScopes     = referenceWidget && referenceWidget.Widgets;
                }
                if (referenceWidget) {
                    referenceBindDataSet = referenceWidget.binddataset;
                    /*the binddataset comes as bind:Variables.VariableName.dataset.someOther*/
                    referenceVariableName = referenceBindDataSet.replace('bind:Variables.', '');
                    referenceVariableName = referenceVariableName.substr(0, referenceVariableName.indexOf('.'));

                    referenceVariable = Variables.getVariableByName(referenceVariableName);
                    fields = (referenceVariable !== null) && $rs.dataTypes &&
                        $rs.dataTypes[referenceVariable.package || referenceVariable.type].fields;
                }
                details = {
                    'referenceVariableName' : referenceVariableName,
                    'referenceWidget'       : referenceWidget,
                    'referenceVariable'     : referenceVariable,
                    'relatedFieldName'      : relatedFieldName
                };
                /* If binddataset is of the format: bind:Widgets.widgetName.selecteditem.something,
                 * i.e. widget is bound to a subset of selected item, get type of that subset.*/
                if (relatedFieldName && fields) {
                    relatedFieldType         = fields[relatedFieldName].type;
                    details.relatedFieldType = relatedFieldType;
                } else {
                    /* When binddataset is of the format: bind:Widgets.widgetName.selecteditem */
                    details.fields = fields;
                }
                return details;
            }
            function fetchDynamicData($scope, elScope, success, error) {
                var reference,
                    referenceVariableKey,
                    watchSelectedItem,
                    referenceVariable;
                /*Invoke the function to fetch the reference variable details when a grid2 is bound to another grid1 and grid1 is bound to a variable.*/
                reference         = fetchReferenceDetails($scope, elScope);
                referenceVariable = Variables.getVariableByName(reference.referenceVariableName);
                /*Check if a watch is not registered on selectedItem or if the relatedField is a one-to-many relation because this field value will directly be available in the data*/
                if ($scope.selectedItemWatched || !referenceVariable || !referenceVariable.isRelatedFieldMany(reference.relatedFieldName)) {
                    return;
                }
                watchSelectedItem = reference.referenceWidget.$watch('selecteditem', function (newVal, oldVal) {

                    $scope.selectedItemWatched = true;

                    /*Check for sanity of newVal.*/
                    /*Check for sanity of newVal.*/
                    if (newVal && !WM.equals(newVal, oldVal)) {
                        /*Check if "referenceVariableKey" has already been computed.*/
                        if (!referenceVariableKey && referenceVariable && referenceVariable.category === 'wm.LiveVariable') {
                            /*Invoke the function to get the primary key.*/
                            referenceVariableKey = referenceVariable.getPrimaryKey();

                            /*If the there is a single primary key, fetch the first element of the array.*/
                            if (referenceVariableKey.length === 1) {
                                referenceVariableKey = referenceVariableKey[0];
                            }

                            /*De-register the watch on selected item.*/
                            watchSelectedItem();

                            /*Register a watch on the primary key field of the selected item.*/
                            reference.referenceWidget.$watch('selecteditem.' + referenceVariableKey, function (newVal) {
                                /*Check for sanity.*/
                                if (newVal) {
                                    /*Invoke the function to update the related data of the variable for the specified relatedFieldName.*/
                                    referenceVariable.updateRelatedData({
                                        'id': reference.referenceWidget.selecteditem[referenceVariableKey],
                                        'relatedFieldName': reference.relatedFieldName
                                    }, function (data) {
                                        /*Check for sanity of data.*/
                                        if (WM.isDefined(data)) {
                                            Utils.triggerFn(success, data);
                                        }
                                    }, function (err) {
                                        Utils.triggerFn(error, err);
                                    });
                                } else {
                                    Utils.triggerFn(success, {});
                                }
                            });
                        }
                    } else {
                        Utils.triggerFn(success, undefined);
                    }
                }, true);
            }
            function getRowOperationsColumn() {
                return {
                    'field'         : 'rowOperations',
                    'type'          : 'custom',
                    'displayName'   : 'Actions',
                    'width'         : '120px',
                    'readonly'      : true,
                    'sortable'      : false,
                    'searchable'    : false,
                    'resizable'     : false,
                    'selectable'    : false,
                    'show'          : true,
                    'operations'    : [],
                    'opConfig'      : {},
                    'pcDisplay'     : true,
                    'mobileDisplay' : true,
                    'include'       : true,
                    'isRowOperation': true
                };
            }
            /**
             * @ngdoc function
             * @name wm.widgets.live.LiveWidgetUtils#getDistinctValues
             * @methodOf wm.widgets.live.LiveWidgetUtils
             * @function
             *
             * @description
             * Returns the distinct values for a field
             *
             * @param {object} filterField definition of the column/ field
             * @param {object} variable variable for the widget
             * @param {function} callBack Function to be executed after fetching results
             *
             */
            function getDistinctValues(filterField, variable, callBack) {
                var query,
                    tableName,
                    columns,
                    aliasColumn,
                    fieldColumn,
                    dataSetWidgetTypes = Utils.getDataSetWidgets();

                fieldColumn = filterField.field;
                if (dataSetWidgetTypes[filterField.widget || filterField.filterwidget] && !filterField.tempDataset) {
                    if (filterField.isRelated) {
                        tableName   = filterField.lookupType;
                        columns     = filterField.lookupField;
                        aliasColumn = columns.replace('.', '_');
                        query       = QueryBuilder.getQuery({
                            'tableName' : tableName,
                            'columns'   : [' DISTINCT ' + columns + ' AS ' + aliasColumn]
                        });
                    } else {
                        aliasColumn = fieldColumn;
                        query       = QueryBuilder.getQuery({
                            'tableName' : variable.propertiesMap.entityName,
                            'columns'   : [' DISTINCT ' + fieldColumn + ' AS ' + filterField.field]
                        });
                    }
                    /* Sending size = 500 because we want to populate all data values in widgets
                     * like select box, checkbox set etc.
                     * NOTE: Currently backend is returning max. 100 records for any page size
                     * more than 100. So this size will need to change once backend is fixed to
                     * return all records instead of max 100 records in this case. */
                    QueryBuilder.executeQuery({
                        'databaseName' : variable.liveSource,
                        'query'        : query,
                        'page'         : 1,
                        'size'         : 500,
                        'nativeSql'    : false,
                        'prefabName'   : variable._prefabName
                    }, function (data) {
                        callBack(filterField, data, aliasColumn);
                    });
                }
            }
            //Method to set the header config of the data table
            function setHeaderConfig(headerConfig, config, field) {
                _.forEach(headerConfig, function (cols) {
                    if (cols.isGroup) {
                        if (cols.field === field) {
                            cols.columns.push(config);
                        } else {
                            setHeaderConfig(cols.columns, config, field);
                        }
                    }
                });
            }
            /**
             * @ngdoc function
             * @name wm.widgets.live.LiveWidgetUtils#setHeaderConfigForTable
             * @methodOf wm.widgets.live.LiveWidgetUtils
             * @function
             *
             * @description
             * Sets the header config for data table
             *
             * @param {object} headerConfig current header config
             * @param {object} config current column/ group config
             * @param {object} $parentEl parent element
             *
             */
            function setHeaderConfigForTable(headerConfig, config, $parentEl) {
                if (_.isEmpty($parentEl)) {
                    headerConfig.push(config);
                } else {
                    setHeaderConfig(headerConfig, config, $parentEl.attr('name'));
                }
            }
            /**
             * @ngdoc function
             * @name wm.widgets.live.LiveWidgetUtils#setFormWidgetsValues
             * @methodOf wm.widgets.live.LiveWidgetUtils
             * @function
             *
             * @description
             * Set the values of the widgets inside the form/ liveform (other than form fields) in form data
             *
             * @param {object} $el current header config
             * @param {object} dataObject current column/ group config
             *
             */
            function setFormWidgetsValues($el, dataObject) {
                if (!$el) {
                    return;
                }
                $el.find('.form-elements [role="input"]').each(function () {
                    var $inputEl = WM.element(this),
                        fieldKey,
                        val;
                    //Get the values of the widgets (other than form fields and composite widgets)
                    if (_.isEmpty($inputEl.closest('[data-role="form-field"]')) && !$inputEl.hasClass('app-composite-widget')) {
                        fieldKey = $inputEl.attr('key') || $inputEl.attr('name');
                        val      = $inputEl.isolateScope() && $inputEl.isolateScope().datavalue;
                        if (val && !_.has(dataObject, fieldKey)) {
                            dataObject[fieldKey] = val;
                        }
                    }
                });
                //Form fields wont't contain grid widgets get those using attribute and add to form data
                $el.find('[data-identifier="grid"]').each(function () {
                    var fieldTarget,
                        formWidget = WM.element(this).isolateScope();
                    fieldTarget = _.split(formWidget.key || formWidget.name, '.');
                    if (fieldTarget.length === 1) {
                        dataObject[fieldTarget[0]] = formWidget.datavalue || formWidget.dataset;
                    } else {
                        dataObject[fieldTarget[0]] = dataObject[fieldTarget[0]] || {};
                        dataObject[fieldTarget[0]][fieldTarget[1]] = formWidget.datavalue || formWidget.dataset;
                    }
                });
            }

            /**
             * @ngdoc function
             * @name wm.widgets.live.getFormWidgets
             * @methodOf wm.widgets.live.LiveWidgetUtils
             * @function
             *
             * @description
             * function to get widgets on form/filter isolate scope
             *
             * @param {object} element from which widgets needs to be retrieved
             */
            function getFormFilterWidgets(element, nameAttr) {
                var wid = {};
                element.find('[init-widget]').not('[name*="_formWidget"]').each(function () {
                    var $target = WM.element(this),
                        _is;
                    if ($target.isolateScope) {
                        _is = $target.isolateScope();
                        //If name attribute is passed, get the value from attribute
                        if (nameAttr) {
                            wid[$target.attr(nameAttr)] = _is;
                        } else if (_is.name) {
                            wid[_is.name] = _is;
                        }
                    }
                });

                return wid;
            }

            /**
             * @ngdoc function
             * @name wm.widgets.live.getViewModeWidgets
             * @methodOf wm.widgets.live.LiveWidgetUtils
             * @function
             *
             * @description
             * function to get view mode widgets for grid
             */
            function getViewModeWidgets() {
                return ['image', 'button', 'checkbox', 'label', 'anchor', 'icon'];
            }

            /**
             * @ngdoc function
             * @name wm.widgets.live.fetchRelatedFieldData
             * @methodOf wm.widgets.live.LiveWidgetUtils
             * @function
             *
             * @description
             * This function fetches the data for the related field in live form/ grid
             *
             * @param {object} columnDef field definition
             * @param {string} relatedField related field name
             * @param {string} datafield Datafield to be set on widget
             * @param {string} widget Type of the widget
             * @param {object} elScope element scope
             * @param {object} parentScope live form// grid scope
             */
            function fetchRelatedFieldData(columnDef, relatedField, datafield, widget, elScope, parentScope) {
                var boundVariable = elScope.Variables[parentScope.variableName || Utils.getVariableName(parentScope)],
                    primaryKeys,
                    displayField;
                if (!boundVariable) {
                    return;
                }
                primaryKeys         = boundVariable.getRelatedTablePrimaryKeys(relatedField);
                columnDef.datafield = datafield;
                displayField        = datafield === 'All Fields' ? undefined : datafield;
                //For autocomplete widget, set the dataset and related field. Autocomplete widget will make the call to get related data
                if (widget === 'autocomplete' || widget === 'typeahead') {
                    columnDef.relatedfield = relatedField;
                    columnDef.dataset      = parentScope.binddataset;
                    displayField           = displayField || (_.isEmpty(primaryKeys) ? undefined : primaryKeys[0]);
                    columnDef.searchkey    = columnDef.searchkey || displayField;
                    columnDef.displaylabel = columnDef.displaylabel || displayField;
                } else {
                    boundVariable.getRelatedTableData(relatedField, {}, function (response) {
                        columnDef.dataset       = response;
                        columnDef.isDefinedData = true;
                        displayField            = displayField || (_.isEmpty(primaryKeys) ? _.head(_.keys(_.get(response, '[0]'))) : primaryKeys[0]);
                        columnDef.displayfield  = columnDef.displayfield || displayField;
                    });
                }
            }
            /**
             * @ngdoc function
             * @name wm.widgets.live.getEditModeWidget
             * @methodOf wm.widgets.live.LiveWidgetUtils
             * @function
             *
             * @description
             * This function returns the default widget for grid
             *
             * @param {object} colDef field definition
             */
            function getEditModeWidget(colDef) {
                var fieldTypeWidgetTypeMap = getFieldTypeWidgetTypesMap();
                if (colDef.relatedEntityName && colDef.primaryKey) {
                    return 'select';
                }
                return (fieldTypeWidgetTypeMap[colDef.type] && fieldTypeWidgetTypeMap[colDef.type][0]) || 'text';
            }
            this.getEventTypes              = getEventTypes;
            this.getDefaultValue            = getDefaultValue;
            this.getLiveWidgetButtons       = getLiveWidgetButtons;
            this.getColumnDef               = getColumnDef;
            this.getButtonDef               = getButtonDef;
            this.getTemplate                = getTemplate;
            this.getHiddenTemplate          = getHiddenTemplate;
            this.translateVariableObject    = translateVariableObject;
            this.getColumnCountByLayoutType = getColumnCountByLayoutType;
            this.getCustomFieldKey          = getCustomFieldKey;
            this.getStepValue               = getStepValue;
            this.splitDimension             = splitDimension;
            this.mergeDimension             = mergeDimension;
            this.getFieldTypeWidgetTypesMap = getFieldTypeWidgetTypesMap;
            this.getMatchModeTypesMap       = getMatchModeTypesMap;
            this.fieldPropertyChangeHandler = fieldPropertyChangeHandler;
            this.preProcessFields           = preProcessFields;
            this.setColumnConfig            = setColumnConfig;
            this.fetchPropertiesMapColumns  = fetchPropertiesMapColumns;
            this.fetchDynamicData           = fetchDynamicData;
            this.fetchReferenceDetails      = fetchReferenceDetails;
            this.getRowOperationsColumn     = getRowOperationsColumn;
            this.getDistinctValues          = getDistinctValues;
            this.setHeaderConfigForTable    = setHeaderConfigForTable;
            this.setFormWidgetsValues       = setFormWidgetsValues;
            this.getWidgetProps             = getWidgetProps;
            this.getFormFilterWidgets       = getFormFilterWidgets;
            this.getViewModeWidgets         = getViewModeWidgets;
            this.parseNgClasses             = parseNgClasses;
            this.fetchRelatedFieldData      = fetchRelatedFieldData;
            this.getEditModeWidget          = getEditModeWidget;
        }
    ])
    .directive('liveActions', ['Utils', 'wmToaster', '$rootScope', 'DialogService', function (Utils, wmToaster, $rs, DialogService) {
        'use strict';
        var getRecords = function (options, success, error) {
                var variable = options.variable;

                variable.update({}, function (response) {
                    Utils.triggerFn(success, response);
                }, function (err) {
                    Utils.triggerFn(error, err);
                });
            },
            insertRecord = function (options, success, error) {
                var variable = options.variable,
                    dataObject = {
                        'row'              : options.row,
                        'transform'        : true,
                        'multipartData'    : options.multipartData,
                        'skipNotification' : true
                    };

                variable.insertRecord(dataObject, function (response) {
                    Utils.triggerFn(success, response);
                }, function (err) {
                    Utils.triggerFn(error, err);
                });
            },
            updateRecord = function (options, success, error) {
                var variable = options.variable,
                    dataObject = {
                        'row'              : options.row,
                        'prevData'         : options.prevData,
                        'multipartData'    : options.multipartData,
                        'transform'        : true,
                        'rowData'          : options.rowData,
                        'skipNotification' : true
                    };

                variable.updateRecord(dataObject, function (response) {
                    Utils.triggerFn(success, response);
                }, function (err) {
                    Utils.triggerFn(error, err);
                });
            },
            deleteRecord = function (options, success, error) {
                var variable   = options.variable,
                    confirmMsg = options.scope.confirmdelete || 'Are you sure you want to delete this?',
                    dataObject = {
                        'row'              : options.row,
                        'transform'        : true,
                        'skipNotification' : true
                    },
                    deleteFn = function () {
                        variable.deleteRecord(dataObject, function (response) {
                            Utils.triggerFn(success, response);
                        }, function (err) {
                            Utils.triggerFn(error, err);
                        });
                    };
                DialogService._showAppConfirmDialog({
                    'caption'   : 'Delete Record',
                    'content'   : confirmMsg,
                    'iconClass' : 'wi wi-delete fa-lg',
                    'resolve'   : {
                        'confirmActionOk': function () {
                            return deleteFn;
                        },
                        'confirmActionCancel': function () {
                            return function () {
                                Utils.triggerFn(options.cancelDeleteCallback);
                            };
                        }
                    }
                });
            },
            performOperation = function (operation, options) {
                var fn,
                    scope = options.scope,
                    successHandler = function (response) {
                        Utils.triggerFn(scope.liveActionSuccess, operation, response);
                        Utils.triggerFn(options.success, response);
                    },
                    errorHandler = function (error) {
                        Utils.triggerFn(scope.liveActionError, operation, error);
                        wmToaster.show('error', 'ERROR', error);
                        Utils.triggerFn(options.error, error);
                    };

                /* decide routine based on CRUD operation to be performed */
                switch (operation) {
                case 'create':
                    fn = insertRecord;
                    break;
                case 'update':
                    fn = updateRecord;
                    break;
                case 'delete':
                    fn = deleteRecord;
                    break;
                case 'read':
                    fn = getRecords;
                    break;
                }

                fn(options, function (response) {
                    if (response.error) {
                        errorHandler(response.error);
                        return;
                    }
                    if (fn !== 'read') {
                        getRecords(options, function () {
                            successHandler(response);
                        }, function () {
                            successHandler(response);
                        });
                    } else {
                        successHandler(response);
                    }
                }, function (error) {
                    errorHandler(error);
                });
            };

        return {
            'restrict': 'A',
            'link': {
                'post': function ($is, $el) {
                    $is.addRow = function () {
                        $rs.$emit('wm-event', $is.name, 'create');
                    };
                    $is.updateRow = function () {
                        $rs.$emit('wm-event', $is.name, 'update');
                    };
                    $is.deleteRow = function () {
                        $rs.$emit('wm-event', $is.name, 'delete');
                    };

                    /* API exposed to make CRUD operations */
                    $is.call = function (operation, data, success, error) {
                        var $elScope = $el.scope(),
                            variableName = Utils.getVariableName($is, $elScope);

                        data.scope = data.scope || $is;
                        data.success = success;
                        data.error = error;
                        data.variable = $elScope.Variables[variableName];

                        performOperation(operation, data);
                    };
                }
            }
        };
    }]);
