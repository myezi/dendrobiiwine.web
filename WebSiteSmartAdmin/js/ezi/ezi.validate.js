/****************************
   基于EziBind和Jquery Validate绑定函数
   目前是简单版本,仅仅通过属性 data-validate 的值来加入一些标准的验证,不同验证用","分隔
   比如 data-ezibind-validate="required,email" 等等
   同时利用()来定义Message,如 data-validate="required(Name is needed!);minlength:6(must > 6)"
   *****************************/

(function ($, window, document) {
    'use strict'


    //options对应Validation的标准Options和当前的Options覆盖
    //type 为4个值 normal 或者 tooltip 2种现实方式
    //normal: 标准文本方式初始化验证
    //tooltip: 提示信息方式初始化验证
    //reset: 重置当前所有验证信息
    //refresh: 重新刷新当前所有控件的验证信息(如果data-validate信息被修改).
    $.fn.eziValidate = function (type,options) {
        var $root = this;
        //如果Form不存在,或者不是form默认对目标元素执行refresh功能
        if (!$root.is("form")) type = "refresh";
        //如果没有加载jquery Validation组件,退出
        if (!$.validator) return;

        //在form data中保存控件索引号,用于拼装唯一name
        var controlindex = $root.data("ezivalidateindex");
        if (controlindex === undefined) controlindex = 1;

        var _addRules = function () {
            var rootid = $root.attr("id") ||"name";
            //设置不同元素的验证
            $root.find("[data-validate]").each(function () {

                var $this = $(this);

                //如果这个控件没有name属性,进行保护,加入临时唯一name,以保证validation控件能够使用
                var name = $this.attr("name");
                if (name == undefined || name == null || name == "") {
                    $this.attr("name", "jv_" + rootid + "_" + controlindex);
                }

                //处理validate属性,根据这个属性拼装Validation功能
                //样例: data-validate="required(Name is needed!),minlength:6(this valud must > 6)"
                var ezibindvalidate = $this.attr("data-validate");

                //如果已经存在ezivalidate属性,并且和原来相同,跳过
                if (ezibindvalidate == $this.data("ezivalidate")) return;

                $this.rules("remove");//首先删除所有已经存在的验证规则

                var validatenames = ezibindvalidate.split(';');
                var rules = {};
                for (var i in validatenames) {
                    if (validatenames[i] == null || validatenames[i] == "") continue;

                    var leftquote = validatenames[i].indexOf('(');
                    var rule = leftquote > 0 ? validatenames[i].substring(0, leftquote) : validatenames[i];
                    var ruleitems = rule.split(':');
                    var name = ruleitems[0];
                    rules[name] = ruleitems.length > 1 ? ruleitems[1] : true;

                    //处理报错信息
                    var rightquote = validatenames[i].lastIndexOf(')');
                    if (leftquote > -1 && rightquote > -1) {
                        //定义信息类
                        if (!rules["messages"]) rules["messages"] = {};
                        rules["messages"][name] = validatenames[i].substring(leftquote + 1, rightquote);
                    }
                }
                $this.rules("add", rules);
                $this.data("ezivalidate", ezibindvalidate);//加入ezivalidate属性来标示该控件已经处理过
                controlindex++;//增加验证控件索引

            });
        }//_addRules

  
        //命令处理函数
        if (type == "normal" || type == "tooltip") {
            var defaultoptions = type != "tooltip" ?
            {
                // Do not change code below
                errorPlacement: function (error, element) {
                    if (!element.is(":radio"))//handle the radio specially,dont need message for radio!
                        error.insertAfter(element.parent());
                }
            } : {
                errorElement: "b",
                // Do not change code below
                errorPlacement: function (error, element) {
                    error.addClass("tooltip tooltip-bottom-left");
                    error.insertAfter(element);
                }
            };

            var finaloptions = $.extend({}, defaultoptions, options);

            ////设置 Form的验证
            var validater = $root.validate(finaloptions);
            _addRules();
        } else if (type == "reset") {
            $root.validate().resetForm();
        } else if (type == "refresh") {
            _addRules();
        } else
            console.log("Unknown type for eziValidate: "+type);

        //在Form数据中保存control index - 该Index主要用于建立不同的Name
        $root.data("ezivalidateindex", controlindex);
    };

    //The accurate date check function.
    //need Date.format script support.
    //because the js Date.parse only support MM/dd/yyyy format , we need translate it 
    $.validator.addMethod("isdate", function (value, element, param) {
        var result = false;
        var strs = value.split("/");
        if (strs.length == 3) {
            var tick = Date.parse(strs[1]+"/"+strs[0]+"/"+strs[2]);
            if (tick != NaN) {
                var date = new Date(tick);
                result = value == date.format("dd/MM/yyyy");
            }
        }
        return this.optional(element) || result;
    }, "Incorrect date format");

    //中文版本的年月字符串检查.
    $.validator.addMethod("yearmonth", function (value, element, param) {
        //由于年月控件是适用mask的,mask在不修改的情况下,value就等于mask本身,这个需要排除.
        var result = /^\d{4}\/?(?:0[1-9]|1[0-2])$/.test(value);
        return this.optional(element) || _optionalmask(value, element) || result;
    }, "Incorrent year and month");

    //compare method support the operator:  'compare:>|<|>=|<=|==#target(message)'.
    $.validator.addMethod("compare", function (value, element, param) {
        var r = false;
        var match = param.match(/^(>=|<=|==|>|<)/);
        if (match != null) {
            var method = match[0];
            var $target = $(param.substring(method.length));
            if ($target[0]) {
                var value2 = $target.val();
                //如果是数字,强行转换为数字
                if ($.isNumeric(value)) value *= 1;
                if ($.isNumeric(value2)) value2 *= 1;
                eval("r=value" + method + "value2;");
            } else
                console.log("Wrong element id of compare validator parameter:" + param);
        } else
            console.log("Wrong operator of compare validator parameter:" + param);

        return this.optional(element) || r;

    }, "The value is incorrect");

    //处理有mask的情况,但为mask字符串的时候,如果当前字符串=mask的本身,返回true
    var _optionalmask = function (value, element) {
        if (value == null || value == "") return true;

        var $ele = $(element);
        var maskformat = $ele.attr("data-mask");
        if (maskformat == undefined) return true;//if there's no data-mask,just leave it.

        var maskplaceholder = $ele.attr("data-mask-placeholder") || 'X';
        return value == maskformat.replace(/9/g, maskplaceholder);
    }


})(jQuery, window, document);
