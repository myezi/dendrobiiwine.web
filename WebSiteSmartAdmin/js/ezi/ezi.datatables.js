/**
* 基于 Datatables控件的一些通用函数库.
* 基于Datatables组件 和Jquery框架
*
**/
(function ($, window) {
    'use strict'

    //适应中文版本的DataTable封装函数
    /* // DOM Position key index //

        l - Length changing (dropdown)
        f - Filtering input (search)
        t - The Table! (datatable)
        i - Information (records)
        p - Pagination (paging)
        r - pRocessing
        < and > - div elements
        <"#id" and > - div with an id
        <"class" and > - div with a class
        <"#id.class" and > - div with an id and class

        Also see: http://legacy.datatables.net/usage/features
    */
    $.fn.dataTable.ext.errMode = 'none';//禁用内部不友好的报错机制,改用自定义的error模式
    $.fn.eziDataTable = function (options) {
        var defaultOpt = {
            //大写的 R 配合dataTables.colReorder.min.js可以实现列的鼠标拖动
            "sDom": "R<'dt-toolbar'<'col-xs-9 col-sm-6'f><'col-sm-6 col-xs-3 dt-new'>r>" +
                    "t" + "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>",
            "autoWidth": true,
            "deferRender": true,
            "order": [],//表示没有任何排序,默认是第一列顺序排列
            //这里不是ServeSide=false(默认),所以ajax仅仅获取一次数据
            "responsive": true  //设定表格为响应式设计,请注意th上面的class,来控制相应的消隐.
            //另外必须引入dataTables.responsive.css
            //多语言设置
            //,"language": {
            //    "info": "显示 第 _PAGE_ 页 共 _PAGES_ 页",
            //    "infoFiltered": " - 从 _MAX_ 条记录中过滤",
            //    "infoEmpty": "无记录显示",
            //    "loadingRecords": "数据加载中...",
            //    "emptyTable": "无任何数据",
            //    "zeroRecords": "没有找到任何记录",
            //    "paginate":
            //        {
            //            "first": "首页",
            //            "last": "末页",
            //            "next": "下页",
            //            "previous": "上页",
            //            "search": "过滤项数:"
            //        }
            //}
        };
        var finalOpt = $.extend(true,{},defaultOpt,options);
        return this.on('error.dt', function (e, settings, techNote, message) {
            console.log('An error has been reported by DataTables: ', message);
        }).DataTable(finalOpt);
    };


    //datatable 官网提供的清除排序的功能
    $.fn.dataTable.Api.register('order.neutral()', function () {
        return this.iterator('table', function (s) {
            s.aaSorting.length = 0;
            s.aiDisplay.sort(function (a, b) {
                return a - b;
            });
            s.aiDisplayMaster.sort(function (a, b) {
                return a - b;
            });
        });
    });

    //内置到datatable api内部的deleteRow函数
    $.fn.dataTable.Api.register('deleteRow()', function (rowIndex) {
        var table = this;
        var currentPage = table.page();
        var pagelen = table.page.info().end - this.page.info().start;
        var currentRow = table.row(rowIndex);
        $(currentRow.node()).fadeOut("slow", function () {
            currentRow.remove();
            if (pagelen == 1 && currentPage > 0)
                table.page(currentPage - 1);
            table.row(rowIndex).draw(false);
        });
    });

    //内置到datatable api内部的updateRow函数
    $.fn.dataTable.Api.register('updateRow()', function (rowIndex, obj) {
        var table = this;
        table.row(rowIndex).data(obj);
        //显示修改动画
        $(table.row(rowIndex).node())
            .css('color', 'red')
            .animate({ color: 'black' }, 2000, 'linear',
            function () { table.row(rowIndex).draw(false); });
    });

    //内置到datatable api内部的insertRow函数
    $.fn.dataTable.Api.register('insertRow()', function (obj) {
        var newrow = this.row.add(obj);
        newrow.draw(false);
        this.order.neutral();
        this.page(0).draw(false);

        //显示添加动画
        $(newrow.node())
            .css('color', 'red')
            .animate({ color: 'black' }, 2000, 'linear');
    });


})(jQuery, window);
