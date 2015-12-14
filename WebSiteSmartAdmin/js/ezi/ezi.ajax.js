/**
* Webezi 的ajax基本库.
* 基于返回的类为AjaxError类,另外需要webezi.msg库的支持
* 特殊参数
   jsondata: 默认为null, 当赋予一个JS对象,让ajax以json方式提交这个对象.可以是数组,在服务器要对应同结构的对象.
   homeiferror: //默认为false,如果是true 如果Ajax报错,允许自动转移转页到首页
**/
(function ($,window) {
    'use strict'

    //初始化ezi js基础类
    if (!window.ezi) window.ezi = function () { };
    ezi.homeurl = ezi.homeurl || "/";

    //Ajax 直接获取Json的封装类
    ezi.getjson = function(url,callback){
        return ezi.ajax({
            url: url,
            success : callback
        });
    }

    //Ajax 直接提交Json的封装类
   ezi.postjson = function (url, json, callback) {
       return ezi.ajax({
                url: url,
                success: callback,
                jsondata: json
            });
   }

    //Aajx ezi封装类
    ezi.ajax = function (options) {

        //合并参数
        var defaultOpt = {
            type: "GET",
            dataType: "json",
            contentType: "application/x-www-form-urlencoded",
            jsondata: null,
            homeiferror: true//如果Ajax报错,允许转页到首页
        }
        options = $.extend(defaultOpt, options);

        //处理jsondata
        if (options.jsondata != null) {
            options.type = "POST";
            options.contentType = "application/json";
            options.data = JSON.stringify(options.jsondata);
        }

        return $.ajax({
            type: options.type,
            url: options.url,
            contentType: options.contentType,
            dataType: options.dataType,
            data: options.data,
            //加入该配置允许Ajax在某些浏览器读写Cookie
            xhrFields : { withCredentials: true},
            beforeSend: function (xhr) {
                if (options.beforeSend) {
                    options.beforeSend(xhr);
                }
            },
            success: function (dataResult, textStatus, xhr) {
                if (options.success) {
                    options.success(dataResult);
                } 
            },
            error: function (error) {
                //自定义处理
                if (options.error != null)
                    options.error(error);
                else
                    ezi.ajaxerror(error,options.homeiferror);
            },
            complete: function (xhr) {
                if (options.complete) {
                    options.complete(xhr);
                }
            }
        });
    }

    //内置的ajax错误处理函数
    ezi.ajaxerror = function (error,homeiferror) {
        //homeiferror默认为true
        if (typeof homeiferror == undefined) homeiferror = true;

        try {
            //处理ASP.NETajax的验证返回
            var jsonRes = error.getResponseHeader('X-Responded-JSON');
            if (jsonRes) {
                var obj = JSON.parse(jsonRes);
                if (obj && obj.status == 401) {
                    ezi.msg.warning('Access Denied by System.', 'Please login again.', function () {
                        if (homeiferror) top.location = ezi.homeurl; //回到首页
                    });
                    return;
                }
            }
           //一般错误从返回体中获取错误信息
          var obj = JSON.parse(error.responseText);
            if (obj.code == 401) {
                ezi.msg.warning(obj.message, 'Access Denied，Please login again.', function () {
                    if (homeiferror) top.location = ezi.homeurl; //回到首页
                });
            } else if (obj.code == 100) {
                ezi.msg.warning(obj.message, 'Business Logic Problem，Please modify the data and submit again.', function () {
                });
            } else
            {
                ezi.msg.systemError(obj.message, "" , function () {
                    //if (homeiferror) top.location = ezi.homeurl; //回到首页
                });
            }
        } catch (e) {
            alert("Connection refused by server, Please contact network administrator.");
            console.log("Core Error occurs: " + e);
            console.log("Response Text: " + error.responseText);
        }
    }


})(jQuery, window);
