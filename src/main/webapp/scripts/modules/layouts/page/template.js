/*global WM, window, _*/

WM.module('wm.layouts.page')
    .run(['$templateCache', function ($templateCache) {
        'use strict';

        $templateCache.put('template/defaults/header.html', '<h1>HEADER</h1>');

        $templateCache.put('template/defaults/topnav.html',
                '<div class="navbar navbar-default">' +
                    '<div class="container-fluid">' +
                        '<div class="collapse navbar-collapse">' +
                            '<ul class="nav navbar-nav">' +
                                '<li class="active"><a href="#">ACTIVE</a></li>' +
                                '<li><a href="#">LINK</a></li>' +
                            '</ul>' +
                        '</div>' +
                    '</div>' +
                '</div>'
            );

        $templateCache.put('template/defaults/leftnav.html',
                '<ul class="nav app-nav nav-pills nav-stacked">' +
                    '<li class="active"><a href="#" class="active">Active</a></li>' +
                    '<li><a href="#">Link</a></li>' +
                '</ul>'
            );

        $templateCache.put('template/defaults/rightnav.html',
                '<ul class="nav app-nav nav-pills nav-stacked">' +
                    '<li class="active"><a href="#" class="active">Active</a></li>' +
                    '<li><a href="#">Link</a></li>' +
                '</ul>'
            );

        $templateCache.put('template/defaults/footer.html', '<h3>FOOTER</h3>');

        $templateCache.put('template/layouts/template.html',
                '<div data-role="template" class="app-template app-page container" init-widget>' +
                    '<header data-role="page-header" class="app-header clearfix" wm-template-container="{{header}}"></header>' +
                    '<section data-role="page-topnav" class="app-top-nav" wm-template-container="{{topnav}}"></section>' +
                    '<main  data-role="page-content" class="app-content clearfix">' +
                        '<div class="row app-content-row clearfix">' +
                            '<aside data-role="page-left-panel" class="app-left-panel col-md-2 col-sm-2" wm-template-container="{{leftnav}}"></aside>' +
                            '<div class="app-page-content app-content-column">' +
                                '<div class="app-ng-transclude" wmtransclude></div>' +
                            '</div>' +
                            '<aside data-role="page-right-panel" class="app-right-panel col-md-2 col-sm-2" wm-template-container="{{rightnav}}"></aside>' +
                        '</div>' +
                    '</main>' +
                    '<footer data-role="page-footer" class="app-footer clearfix" wm-template-container="{{footer}}"></footer>' +
                '</div>'
            );
        $templateCache.put('template/layouts/templateshowcase.html',
                '<div class="app-template showcase" data-ng-hide="hideShowCase">' +
                    '<div class="showcase-header row">' +
                        '<div class="col-sm-5 template-title">{{templates[activeTemplateIndex].id}}</div>' +
                        '<div class="col-sm-2 nav-actions">' +
                            '<span class="glypicon glyphicon glyphicon-menu-left nav-action" data-ng-click="prev()"></span>' +
                            '<span class="template-index">{{activeTemplateIndex + 1}}</span> of ' +
                            '<span class="template-count">{{templates.length}}</span>' +
                            '<span class="glypicon glyphicon glyphicon-menu-right nav-action" data-ng-click="next()"></span>' +
                        '</div>' +
                        '<div class="col-sm-5">' +
                            '<button class="btn btn-primary hide-show-case-btn" data-ng-click="hideShowCase = true">' +
                                '<span><i class="fa fa-close"/></span> ' +
                            '</button>' +
                            '<button class="btn btn-primary view-all-template-btn" data-ng-click="showAll = !showAll">' +
                                '<span class="glyphicon glyphicon-menu-up" data-ng-hide="showAll"></span>' +
                                '<span class="glyphicon glyphicon-menu-down" data-ng-show="showAll"></span>' +
                                '<span> Templates </span> ' +
                            '</button>' +

                        '</div>' +
                    '</div>' +
                    '<div class="showcase-body" data-ng-show="showAll">' +
                        '<ul class="list-inline">' +
                            '<li data-ng-repeat="template in templates track by $index">' +
                                '<div data-ng-class="{\'template-tile\': true, \'active\': $index === activeTemplateIndex}" data-ng-click="showTemplate($index)">' +
                                    '<div  class="image-wrapper">' +
                                        '<img src="resources/images/imagelists/default-image.png" data-ng-if="!template.thumbnail">' +
                                        '<img data-ng-src="{{\'resources/\' + template.id + \'/\'+ template.thumbnail}}" data-ng-if="template.thumbnail">' +
                                    '</div>' +
                                    '<div class="template-title">{{template.id}}</div>' +
                                '</div>' +
                            '</li>' +
                        '</ul>' +
                    '</div>' +
                '</div>'
            );
    }])
    .directive('wmTemplate', [
        '$templateCache',
        'PropertiesFactory',
        'WidgetUtilService',
        'CONSTANTS',
        '$compile',

        function ($templateCache, PropertiesFactory, WidgetUtilService, CONSTANTS, $compile) {
            'use strict';

            var widgetProps = PropertiesFactory.getPropertiesOf('wm.template', []),
                templateShowCaseRendered = false;

            return {
                'restrict': 'E',
                'replace': true,
                'transclude': true,
                'scope': {},
                'template': $templateCache.get('template/layouts/template.html'),
                'compile': function () {
                    return {
                        'pre': function (scope) {
                            scope.widgetProps = widgetProps;
                        },
                        'post': function (scope, element, attrs) {
                            WidgetUtilService.postWidgetCreate(scope, element, attrs);

                            if (CONSTANTS.isRunMode && !templateShowCaseRendered) {
                                templateShowCaseRendered = true;
                                $compile('<wm-template-showcase></wm-template-showcase>')(scope.$root);
                            }
                        }
                    };
                }
            };
        }
    ])
    .directive('wmTemplateShowcase', [
        '$templateCache',
        '$location',
        'Utils',
        '$routeParams',
        '$timeout',

        function ($templateCache, $location, Utils, $routeParams, $timeout) {
            'use strict';

            var MSGS = {
                'HIDE_TEMPLATES_SHOW_CASE': 'hide-templates-show-case',
                'SHOW_TEMPLATES_SHOW_CASE': 'show-templates-show-case',
                'UPDATE_LOCATION': 'update-location-path',
                'SELECT_TEMPLATE': 'select-template',
                'TEMPLATEBUNDLE_CONFIG': 'template-bundle-config',
                'ON_LOAD': 'on-load'
            };

            function postMessage(content) {
                window.top.postMessage(content, '*');
            }

            return {
                'restrict': 'E',
                'replace': true,
                'template': $templateCache.get('template/layouts/templateshowcase.html'),
                'scope': {},
                'link': function (scope, element) {

                    var pageName = $routeParams.name;

                    scope.showAll = true;
                    Utils.fetchContent(
                        'json',
                        Utils.preventCachingOf('./config.json'),
                        function (response) {
                            scope.templates = [];
                            if (!response.error) {
                                scope.templates = response.templates;
                                postMessage({'key': MSGS.TEMPLATEBUNDLE_CONFIG, 'config': response});
                            }
                        },
                        WM.noop,
                        true
                    );

                    scope.prev = function () {
                        var i = --scope.activeTemplateIndex;
                        i = i < 0 ? 0 : i;
                        scope.showTemplate(i);
                    };

                    scope.next = function () {
                        var i = ++scope.activeTemplateIndex,
                            len = scope.templates.length;
                        i = i >= len ? len - 1 : i;
                        scope.showTemplate(i);
                    };

                    scope.showTemplate = function (idx) {
                        var template = scope.templates[idx];
                        scope.activeTemplateIndex = idx;
                        $location.path(template.id);
                    };

                    scope.activeTemplateIndex = 0;

                    if (pageName) {
                        scope.templates.some(function (template, idx) {
                            if (pageName === template.id) {
                                scope.activeTemplateIndex = idx;
                                return true;
                            }
                        });
                    }

                    WM.element('html > body:first').append(element);

                    window.onmessage = function (msg) {

                        if (!WM.isObject(msg.data)) {
                            return;
                        }

                        var key = msg.data.key;

                        switch (key) {
                        case MSGS.HIDE_TEMPLATES_SHOW_CASE:
                            scope.hideShowCase = true;
                            break;
                        case MSGS.SELECT_TEMPLATE:
                            scope.showTemplate(msg.data.templateIndex);
                            break;
                        }

                        scope.$root.$safeApply(scope);
                    };

                    scope.$root.$on('$routeChangeSuccess', function () {
                        postMessage({'key': MSGS.UPDATE_LOCATION, 'location': $location.absUrl()});
                    });

                    $timeout(function () {
                        postMessage({'key': MSGS.ON_LOAD});
                    });
                }
            };
        }
    ])
    .directive('wmTemplateContainer', function (FileService, CONSTANTS, $rootScope, Utils, $compile, $templateCache) {
        'use strict';

        var ERROR_CONTENT = '<div class="app-partial-info"><div class="partial-message">Content for the container is unavailable.</div></div>',
            ROLE_DEFAULTCONTENTURL_MAP = {
                'page-header': 'template/defaults/header.html',
                'page-topnav': 'template/defaults/topnav.html',
                'page-left-panel': 'template/defaults/leftnav.html',
                'page-right-panel': 'template/defaults/rightnav.html',
                'page-footer': 'template/defaults/footer.html'
            };

        function hideContent($el) {
            $el.html('').hide();
        }

        function getTemplatePath(templateName) {
            var templatePath = 'pages/' + templateName + '/page.min.html';
            return CONSTANTS.isStudioMode ? '../../' + templatePath : templatePath;
        }

        function displayDefaultContent(element) {
            var key = element.attr('data-role'),
                url = ROLE_DEFAULTCONTENTURL_MAP[key],
                content = $templateCache.get(url);

            element.html(content).show();
        }

        function compileTemplate(scope, element, content) {
            var $content = WM.element(content);

            $content = $content.contents();
            $compile($content)(scope);
            element.append($content).show();
        }

        function loadTemplate(scope, element, templateName) {

            var pageContent;

            FileService.read({
                path: getTemplatePath(templateName),
                projectID : $rootScope.project.id
            }, function (response) {
                pageContent = Utils.parseCombinedPageContent(response, templateName);
                compileTemplate(scope, element, pageContent.html);
            }, function () {
                element.html(ERROR_CONTENT);
            });
        }

        return {
            'link': function (scope, element, attrs) {

                if (attrs.wmTemplateContainer) {
                    attrs.$observe('wmTemplateContainer', function (nv) {
                        if (nv) {
                            if (nv === '_nocontent') {
                                hideContent(element);
                            } else if (nv === '_defaultcontent') {
                                displayDefaultContent(element);
                            } else {
                                loadTemplate(scope, element, nv);
                            }
                        } else {
                            hideContent(element);
                        }
                    });
                }
            }
        };
    });

