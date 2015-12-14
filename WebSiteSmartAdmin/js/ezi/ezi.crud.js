/**
* Ezi 针对常用的增删改查进行的的一些封装类.
* 基于KnockoutJS DataTable JqueryValidation 等三方组件
* 和 ezi的大部分内部组件包括 ezi.validation ezi.knockout ezi.msg ezi.datatable
**/
(function ($, window, document) {
    'use strict'

    ezi.createCrudController = function (options) {
        return new CrudController(options);
    }

    var CrudController = function (options) {
        //Option 包括
        //viewmodel: 对应KO的 viewmodel: 
        //该viewmodel 必须包括下列属性: Core 为核心业务类, Load(data) 为加载业务对象函数, 
        //New() 为新建业务对象函数, EditMode(bool) 为切换编辑状态函数, GetName(data) 为获取对象的名称,用于删除, ToJS() 为转换业务对象为JS对象 
        //editform: 为编辑Form的选择器,一般类似 '#form'
        //datatable: 为DataTable控件的主选择器,一般类似 '#table'
        //deleteurl: 提交删除的url
        //saveurl: 提交保存的url

        var self = this;
        self.viewModel = options.viewmodel;
        self.editForm = options.editform;
        self.dataTable = options.datatable;
     
        //当前修改的行
        self.editRowIndex = -1;//-1表示新建

        //建立新的设置
        self.create = function () {
            self.editRowIndex = -1;
            self.viewModel.New();
            $(self.editForm).eziValidate("reset");//重置Form的验证
            self.viewModel.EditMode(true);
        };
        //修改指定设置
        self.edit = function (e) {
            e.preventDefault();
            //利用当前控件的父tr定位行元素是性能最高的方式
            var $row = $(e.currentTarget).closest("tr");
            var table = $(self.dataTable).DataTable();
            var tableRow = table.row($row);
            var data = tableRow.data();

            self.editRowIndex = tableRow.index();

            self.viewModel.Update(data);
            $(self.editForm).eziValidate("reset");//重置验证
            self.viewModel.EditMode(true);
        };

        //删除指定设置
        self.delete = function (e) {
            e.preventDefault();
            //利用当前控件的父tr定位行元素是性能最高的方式
            var $row = $(e.currentTarget).closest("tr");
            var table = $(self.dataTable).DataTable();
            var tableRow = table.row($row);
            var data = tableRow.data();
            ezi.msg.confirm("Are you to delete: " + self.viewModel.GetName(data) + " ?", "", function () {

                ezi.postjson(options.deleteurl, data, function (result) {
                    if (result.status)
                        table.deleteRow(tableRow.index());
                    else
                        ezi.msg.warning(result.message);
                });//postjson

            });//confirm
        };

        //提交修改到服务端,如果因为特别需要,可以通过ignorevalid参数控制验证,如果为true,则忽略检验
        self.save = function (ignorevalid) {
            if (!ignorevalid && !$(self.editForm).valid()) return;

            var $saveBtn = $(event.currentTarget);
            $saveBtn.toggleLoading(true);

            var table = $(self.dataTable).DataTable();
            var data = self.viewModel.ToJS();//从ViewModel中获取获取当前填写的数据
            //开始触发保存行为
            //是新建行为或者对象不相等
            ezi.postjson(options.saveurl, data, function (result) {
                if (result.status) {
                    if (self.editRowIndex != -1) {
                        //更新数据
                        table.updateRow(self.editRowIndex, result.data);
                    } else {
                        //添加数据
                        table.insertRow(result.data);
                    }
                    self.viewModel.EditMode(false);
                }
                else
                    ezi.msg.warning(result.message);
            }).always(function () {
                $saveBtn.toggleLoading(false);
            });//postjson
        };

        //回到列表
        self.back = function () {
            self.viewModel.EditMode(false);
        };

    }
   

})(jQuery, window, document);
