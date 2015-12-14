/**
* Ezi 的一些Form元素的封装类基本库.
* 一般基于JqueryUI和Bootstrap的一些组件
*
**/
(function ($, window, document) {

    'use strict'

    //支持普通的selectbox.
    //use  $("").select2array(array);
    //array is something like :  [{id=1,text='Name1',group=''} ....];
    $.fn.selectarray = function (array) {
        var $this = $(this);
        var title = $this.attr("title");
        if (title) $this.append('<option value="" class="text-muted">' + title + '</options>');
        //calculate the group of the array
        var groups = [];
        for (var i in array) if (groups.indexOf(array[i].group) == -1)groups.push(array[i].group);
        //make the options
        if (groups.length == 1)
            for (var i in array) $this.append('<option value="' + array[i].id + '">' + array[i].text + '</options>');
        else if (groups.length > 1) 
            for (var g in groups) {
                var optgroup = $('<optgroup label="' + groups[g] + '"></optgroup>');
                var subarray = array.filter(function (item) { return item.group == groups[g]; });
                for (var i in subarray) optgroup.append('<option value="' + subarray[i].id + '">' + subarray[i].text + '</options>');
                $this.append(optgroup);
            }
    }

    //auto complete extension, need auto complete support bu jquery UI.
    //use  $("").autocomplete2({ source: data });
    //data is something like :  ["c++", "java", "php", "coldfusion", "javascript", "asp", "ruby"];
    $.fn.autocomplete2 =  function (options) {
        var $this = $(this);
        var opt = $.extend(
            { "minLength": 0, "select": function (event, ui) { $this.attr("value",ui.item.value); alert($this.val()); } }, options);
        var result = $this.autocomplete(opt);
        //Add arrow to the control for show list for all.
        $('<i class="icon-append fa fa-chevron-down" style="cursor:pointer" onclick="$(this).siblings(\'input\').autocomplete(\'search\', \'\')"></i>').insertBefore($this);
        return result;
    }

    //select2 extension, need select2 support .
    //use  $("").select2array(array);
    //array is something like :  [{id=1,text='Name1',group=''} ....];
    $.fn.select2array = function (array) {
        var $this = $(this);
        if (array == undefined)
            return $this.select2({ width: '100%', allowClear: true });
        else if ($this.is("select")) {
            var title = $this.attr("title");
            if (title) $this.append('<option value="" class="text-muted">' + title + '</options>');

            //calculate the group of the array
            var groups = [];
            for (var i in array) if (groups.indexOf(array[i].group) == -1) groups.push(array[i].group);
            //make the options
            if (groups.length == 1)
                for (var i in array) $this.append('<option value="' + array[i].id + '">' + array[i].text + '</options>');
            else if (groups.length > 1) {
                for (var g in groups) {
                    var optgroup = $('<optgroup label="' + groups[g] + '"></optgroup>');
                    var subarray = array.filter(function (item) { return item.group == groups[g]; });
                    for (var i in subarray) optgroup.append('<option value="' + subarray[i].id + '">' + subarray[i].text + '</options>');
                    $this.append(optgroup);
                }
            }
            return $this.select2({ width: '100%', allowClear: true });
    }
        else
            return $this.select2({ data: array, width: '100%', allowClear: true});
    }

    //显示加载中的按钮,loading: true为显示加载状态,false为恢复原状态. loadingtext为加载的文字显示.
    $.fn.toggleLoading = function (loading, loadingtext) {
        var $this = $(this);
        var text = loadingtext || "Loading...";
        if (loading) {
            $this.data("_html", $this.html());
            $this.html("<i class='fa fa-refresh fa-spin'></i> " + text);
            $this.addClass("disabled");
        } else {
            var html = $this.data("_html");
            if (html) $this.html(html);
            $this.removeClass("disabled");
            $this.removeData("_html");
        }
    }
  

})(jQuery, window, document);
