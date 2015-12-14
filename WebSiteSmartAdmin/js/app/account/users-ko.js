// PAGE RELATED SCRIPTS
// destroy generated instances
// pagedestroy is called automatically before loading a new page
// only usable in AJAX version!
var pagedestroy = function () {
    viewModel = null;//消亡ViewModel类
}


//定义当前页面的 View Model
var ViewModel = function () {
    var self = this;

    self.Id = ko.observable();
    self.UserName = ko.observable();
    self.OldPassword = ko.observable("");
    self.Password = ko.observable("");
    self.PhoneNumber = ko.observable();
    self.Email = ko.observable();
    self.Roles = ko.observableArray(); //用户现在的Role列表
    self.RoleList = ko.observableArray();//所偶Role的name的数组

    self.IsNew = ko.computed(function () { return self.Id() == ""; });
};
//ViewModel实例
var viewModel = new ViewModel();

//构建基于KO的增删改控制引擎
var controller = ezi.createCrudController({
    'viewmodel': viewModel,//ViewModel
    'editform': "#formEdit",//主formID
    'datatable': "#dtMain",//主列表ID
    'deleteurl': API_USER_DELETE,//删除对象API
    'saveurl': API_USER_SAVE//保存对象API
});

//清空ViewModel内容
var resetViewModel = function () {
    viewModel.Id("").UserName("").Password("").PhoneNumber("").Email("").Roles([]);
}


// 入口函数
var pagefunction = function () {

    //绑定编辑数据
    ko.applyBindings(viewModel, $('#divEdit')[0]);

    $('#divEdit').hide();
    //设定Form的验证条件
    $('#formEdit').eziValidate("tooltip");

    /* 绑定列表 - 远程获取数据,但是假分页 ;*/
    ezi.getjson(API_USER_GETALL, function (result) {

        var table = $('#dtMain').eziDataTable({
            "autoWidth": false,
            //这里不是ServeSide=false(默认),所以ajax仅仅获取一次数据
            "data": result,
            //columns定义获取的数据和列的对应关系
            "columns": [{}, { "data": "UserName" }, { "data": "Email" }, { "data": "PhoneNumber" }, { "data": "Roles" }, { "data": "Id" }],
            "columnDefs": [{
                // The `data` parameter refers to the data for the cell (defined by the
                // `data` option, which defaults to the column being worked with, in
                // this case `data: 0`.
                "searchable": false,
                "orderable": false,
                "render": function (data, type, row, meta) {
                    //meta: row : current row index; col: current column index, data is the data of the cell
                    var content = '<a  href="#" class="btn btn-primary btn-xs editbtn"><i class="fa fa-pencil"></i></a> ';
                    content += '<a href="#" class="btn btn-danger btn-xs deletebtn"><i class="fa fa-minus"></i></a>';
                    return content;
                },
                "targets": 5 //最后一格
            },
            {
                "searchable": false,
                "orderable": false,
                "render": function (data, type, row, meta) {
                    return '<img src="/img/male.png" alt="" width="20">';
                },
                "targets": 0 //第一格
            },
            {
                "searchable": true,
                "orderable": false,
                "render": function (data, type, row, meta) {
                    var content = "";
                    for (var i in data) {
                        var style = data[i] == "admin" ? "warning" : "success";
                        content += ('<span class="label label-' + style + '">' + data[i] + '</span> ');
                    }
                    return content;
                },
                "targets": 4 //第一格
            }
            ],
            "initComplete": function (settings, json) {
                //处理列表加载完毕以后的事件
                //绑定edit和delete按钮事件
                $('#divTable').on("click.editbtn", ".editbtn", editrow);
                $('#divTable').on("click.deletebtn", ".deletebtn", deleterow);

                //加入新建按钮
                $('#divTable div.dt-new').html('<a href="javascript:create();" class="btn btn-success pull-right"><i class="fa fa-plus"></i> Create</a>');
            }
        });
   
    });

    //绑定Roles
    ezi.getjson(API_USER_GETALLROLE, function (result) {
        for (var i in result) viewModel.RoleList.push(result[i]);
    });

};

//新建数据数据
function create() {
    currentRowIndex = -1;

    $("#divTable").fadeOut("fast", function () {
        //绑定数据-实现绑定空数据的功能
        resetViewModel();//把ViewModel清空

        $(':password').val("");//清除所有密码框
        $('#formEdit').eziValidate("reset");//重新设定Form的验证

        $('#divEdit h2').text("Create User");
        $('#divEdit').fadeIn("normal");
    });
}

//修改数据,思路:把list内部数据传入修改界面,并显示.
//修改以后提交服务器(主要问题,需要考虑数据交叉修改的问题)
var currentRowIndex = -1;//-1表示新建
function editrow(event) {
    event.preventDefault();
    //利用当前控件的父tr定位行元素是性能最高的方式
    var $row = $(event.currentTarget).closest("tr");
    var table = $('#dtMain').DataTable();
    var tableRow = table.row($row);

    currentRowIndex = tableRow.index();
    $("#divTable").fadeOut("fast", function () {
        //绑定数据
        ko.mapping.fromJS(tableRow.data(), {}, viewModel);//把对象数据映射到ViewModel

        $(':password').val("");//清除所有密码框
        $('#formEdit').eziValidate("reset");//重新设定Form的验证

        $('#divEdit h2').text("Update User");
        $('#divEdit').fadeIn("normal");
    });

}


//删除数据
function deleterow(event) {
    event.preventDefault();
    //利用当前控件的父tr定位行元素是性能最高的方式
    var $row = $(event.currentTarget).closest("tr");
    var table = $('#dtMain').DataTable();
    var tableRow = table.row($row);

    ezi.msg.confirm("Are you sure to delete the user: " + tableRow.data()["UserName"] + " ?", "", function () {

        ezi.ajax({
            url: API_USER_DELETE,
            jsondata: tableRow.data(),
            success: function (result) {
                if (result.status)
                    table.deleteRow(tableRow.index());
                else
                    ezi.msg.warning(result.message);
            }
        });
    });

}

//保存员工信息
function save() {

    //验证form
    if (!$('#formEdit').valid()) return;

    var table = $('#dtMain').DataTable();
    var user = ko.toJS(viewModel);//从ViewModel中获取获取当前填写的数据
    //var oldUser = currentRowIndex != -1 ? table.row(currentRowIndex).data() : null;

    //开始触发保存行为
    //是新建行为或者对象不相等
    ezi.ajax({
        url: API_USER_SAVE,
        jsondata: user,
        success: function (result) {
            if (result.status) {
                $("#divEdit").fadeOut("fast", function () {
                    $('#divTable').fadeIn("normal", function () {
                        //这里区分新建和保存
                        if (currentRowIndex != -1) {
                            //重新设定数据
                            table.updateRow(currentRowIndex, result.data);
                        } else {
                            //添加数据
                            table.insertRow(result.data);
                        }
                    });//fadeIn
                });//fadeOut
            }
            else
                ezi.msg.warning(result.Message);
        }//success
    });//ajax
}//save

//回到列表
function backtolist() {
    $("#divEdit").fadeOut("fast", function () {
        $('#divTable').fadeIn("normal");
    });
}
