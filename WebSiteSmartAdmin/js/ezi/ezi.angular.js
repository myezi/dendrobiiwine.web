/**
* Webezi 的一些支持AngularJS的基本库.
* 基于AngularJS框架
*
**/
(function ($, window,angular) {
    'use strict'

    //初始化ezi js基础类
    if (!window.ezi) window.ezi = function () { };
    ezi.angular = function () { };

    //Add directive of onFinishRender
    ezi.angular.addDirectiveOnFinishRender = function (module) {
        module.directive('onFinishRender', function ($timeout) {
            return {
                restrict: 'A',
                link: function (scope, element, attr) {
                    if (scope.$last === true) {
                        $timeout(function () {
                            scope.$emit('ngRepeatFinished');
                        });
                    }
                }
            }//return
        });
    }

    //Add directive of checkList of Checkbox elements
    ezi.angular.addDirectiveCheckList = function (module) {
        module.directive('checkList', function () {
            return {
                scope: {
                    list: '=checkList',
                    value: '@'
                },
                link: function (scope, elem, attrs) {
                    var handler = function (setup) {
                        var checked = elem.prop('checked');
                        var index = scope.list ? scope.list.indexOf(scope.value) : -1;

                        if (checked && index == -1) {
                            if (setup) elem.prop('checked', false);
                            else scope.list.push(scope.value);
                        } else if (!checked && index != -1) {
                            if (setup) elem.prop('checked', true);
                            else scope.list.splice(index, 1);
                        }
                    };

                    var setupHandler = handler.bind(null, true);
                    var changeHandler = handler.bind(null, false);

                    elem.bind('change', function () {
                        scope.$apply(changeHandler);
                    });
                    scope.$watch('list', setupHandler, true);
                }
            };
        });
    }

})(jQuery, window, angular);
