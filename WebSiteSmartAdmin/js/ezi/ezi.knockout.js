/**
* Ezi 针对KnockoutJS的一些封装类基本库.
* 基于KnockoutJS组件
*
**/
(function ($, window, document) {
    'use strict'

    //封装的KO Bind数据的函数.
    //View model为绑定的视图模型对象.
    $.fn.eziKOBind = function (viewmodel) {
        ko.applyBindings(viewmodel, this[0]);
    }

    //KO和autocomplete的连接封装,需要Jquery UI库支持
    //data-bind="autoComplete: { value: selectedOption, options: options }"
    ko.bindingHandlers.autoComplete = {
        // Only using init event because the Jquery.UI.AutoComplete widget will take care of the update callbacks
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            // { selected: mySelectedOptionObservable, options: myArrayOfLabelValuePairs }
            var settings = valueAccessor();

            var valueOption = settings.value;
            var options = settings.options;

            var updateElementValueWithLabel = function (event, ui) {
                // Stop the default behavior
                event.preventDefault();
                if (ui.item == undefined || ui.item == null) return;

                // Update the value of the html element with the label 
                // of the activated option in the list (ui.item)
                $(element).val(ui.item.label);

                // Update our SelectedOption observable
                if (typeof ui.item.label !== "undefined") {
                    // ui.item - label|value|...
                    valueOption(ui.item.label);
                }
            };

            //初始值
            $(element).val(valueOption());
            //自身的change
            $(element).on("change.ko.autocomplete", function (event) {
                event.preventDefault();
                valueOption($(this).val());
            });

            $(element).autocomplete({
                source: options,
                minLength: 0,
                select: function (event, ui) {
                    updateElementValueWithLabel(event, ui);
                },
                focus: function (event, ui) {
                    updateElementValueWithLabel(event, ui);
                },
                change: function (event, ui) {
                    updateElementValueWithLabel(event, ui);
                }
            });
          
            //基于SmartAdmin模板的特殊处理
            $('<i class="icon-append fa fa-chevron-down" style="cursor:pointer" onclick="$(this).siblings(\'input\').autocomplete(\'search\', \'\')"></i>').insertBefore($(element));
        }
    };

    //KO和select2的连接封装,需要Select2库支持
    //data-bind="select2: {  options:Source,optionsText:'text',optionsValue:'key',optionsGroup:'group',value:BindData,optionsCaption:'Please Select'  }"
    ko.bindingHandlers.select2 = {
        // Only using init event because the Jquery.UI.AutoComplete widget will take care of the update callbacks
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            // { selected: mySelectedOptionObservable, options: myArrayOfLabelValuePairs }
            var settings = valueAccessor();

            var valueOption = settings.value;
            var options = settings.options;
            var optionsText = settings.optionsText;
            var optionsValue = settings.optionsValue;
            var optionsGroup = settings.optionsGroup;
            var optionsCaption = settings.optionsCaption;

            //构建Select2
            var $this = $(element);
            var select2Opt = { width: '100%', allowClear: true };
            if (options == undefined || options == null || options.length == 0)
                $this.select2(select2Opt);
            else if ($this.is("select")) {
                //check text and value
                if (!options[0][optionsValue]) console.log(optionsValue + " is not valid 'id' property of select2 data");
                if (!options[0][optionsText]) console.log(optionsValue + " is not valid 'text' property of select2 data");

                if (optionsCaption) $this.append('<option value="" class="text-muted">' + optionsCaption + '</options>');
                //calculate the group of the array
                var groups = [];
                if (optionsGroup)
                  for (var i in options) if (groups.indexOf(options[i][optionsGroup]) == -1) groups.push(options[i][optionsGroup]);

                //make the options
                if (groups.length == 1)
                    for (var i in options) $this.append('<option value="' + options[i][optionsValue] + '">' + options[i][optionsText] + '</options>');
                else if (groups.length > 1) {
                    for (var g in groups) {
                        var optgroup = $('<optgroup label="' + groups[g] + '"></optgroup>');
                        var subarray = options.filter(function (item) {
                            return item[optionsGroup] == groups[g];
                        });
                        for (var i in subarray) optgroup.append('<option value="' + subarray[i][optionsValue] + '">' + subarray[i][optionsText] + '</options>');
                        $this.append(optgroup);
                    }
                }
                $this.select2(select2Opt);
            }
            else 
                $this.select2($.extend({},select2Opt,{ data: options }));
            

            //绑定事件.
            $this.on("select2-selecting", function (e) {
                valueOption(e.val);
            });

            //初始化初始值
            $this.val(valueOption()).trigger("change");
        }
    };


    //初始化ezi js基础类
    if (!window.ezi) window.ezi = function () { };
    ezi.ko = function () { };

    //重置一个viewModel对象中的数据 - 目前仅用于全部是Observerable的简单对象.
    ezi.ko.resetViewModel = function (viewModel) {
        _resetObject(viewModel);
    }

    var _resetObject = function (obj) {
        if (obj == undefined || obj == null) return;
        for (var i in obj) {
            if ($.isFunction(obj[i]) && obj[i].__ko_proto__)
                obj[i]("");
            else
                if ($.isPlainObject(obj[i])) _resetObject(obj[i]);
        }
    }

    ezi.ko.getJSObject = function (viewModel) {
        var obj = ko.toJS(viewModel);
        obj.__ko_mapping__ = undefined;
        return obj;
    }


})(jQuery, window, document);
