//对应ng-controller = "userController" 的控制方法
var userControllerFunc = function ($scope, $http, $compile) {

    $('#formEdit').eziValidate("tooltip");

    //加载Roles数据
    $http.get('/api/user/getallroles').success(function (roles) {
        $scope.RoleList = roles;
    });

    //Indicate current edit row index
    $scope.currentRowIndex = -1;
  
    //新建用户
    $scope.create = function ($event) {
        $event.preventDefault();

        $scope.currentRowIndex = -1;
        $("#divTable").fadeOut("fast", function () {
            //绑定数据-实现绑定空数据的功能
            $scope.User = {Roles:[]};//Roles must be init becasue it's bind as a list.other fields are ok to leave as undefined.
            $scope.$apply(function () {
                $scope.EditType = "Create User";
            });
            $('#formEdit').eziValidate("reset");//重新设定Form的验证
            $('#divEdit').fadeIn("normal");
        });
    }

    //编辑用户
    $scope.edit = function ($event) {
        $event.preventDefault();
        //利用当前控件的父tr定位行元素是性能最高的方式
        var $row = $($event.currentTarget).closest("tr");
        var table = $('#dtMain').DataTable();
        var tableRow = table.row($row);

        $scope.currentRowIndex = tableRow.index();
        $("#divTable").fadeOut("fast", function () {
            //绑定数据
            $scope.User = tableRow.data();
            $scope.$apply(function () {
                $scope.EditType = "Update User";
            });
            //$(':password').val("");//清除所有密码框
            $('#formEdit').eziValidate("reset");//重新设定Form的验证
            $('#divEdit').fadeIn("normal");
        });
    }

    //删除用户
    $scope.remove = function ($event) {
        $event.preventDefault();

        //利用当前控件的父tr定位行元素是性能最高的方式
        var $row = $($event.currentTarget).closest("tr");
        var table = $('#dtMain').DataTable();
        var tableRow = table.row($row);

        ezi.msg.confirm("Are you sure to delete the user: " + tableRow.data()["UserName"] + " ?", "", function () {

            $http.post('/api/user/deleteuser', tableRow.data()).success(function (result) {
                    if (result.status)
                        table.deleteRow(tableRow.index());
                    else
                        ezi.msg.warning(result.message);
                });

        });//ezi.msg.confirm
    }

  
    //保存用户
    $scope.save = function () {
 
        //验证form
        if (!$('#formEdit').valid()) return;

        var table = $('#dtMain').DataTable();
   
        //开始触发保存行为
        //是新建行为或者对象不相等
        $http.post('/api/user/saveuser', $scope.User)
           .success(function (result) {
               if (result.status) {
                   $("#divEdit").fadeOut("fast", function () {
                       $('#divTable').fadeIn("normal", function () {
                           //这里区分新建和保存
                           if ($scope.currentRowIndex != -1) {
                               //重新设定数据
                               table.updateRow($scope.currentRowIndex, result.data);
                           } else {
                               //添加数据
                               table.insertRow(result.data);
                           }
                       });//fadeIn
                   });//fadeOut
               }
               else
                   ezi.msg.warning(result.message);
           });//success
    
    }

    //Back to list from edit form.
    $scope.backtolist = function () {
        $("#divEdit").fadeOut("fast", function () {
            $('#divTable').fadeIn("normal");
        });
    }

    //hide edit div
    $('#divEdit').hide();

    //Init the data table

    // bind the user list
    $http({ method: 'GET', url: '/api/user/getallusers' }).success(function (result) {

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
                    var content = '<a  href="#" ng-click="edit($event)" class="btn btn-primary btn-xs"><i class="fa fa-pencil"></i></a> ';
                    content += '<a href="#" ng-click="remove($event)" class="btn btn-danger btn-xs"><i class="fa fa-minus"></i></a>';
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
            "drawCallback": function (settings) {
                //complie the html in table for angular because some of them are dynamiclly generated
                console.log("complie the html in table");
                $compile(angular.element('#dtMain'))($scope);
            }
        });

        //加入新建按钮
        $('#divTable div.dt-new').append($compile('<a href="#" ng-click="create($event)" class="btn btn-success pull-right"><i class="fa fa-plus"></i> Create</a>')($scope));
    });
 
}

var pagedestroy = function () {
}

var pagefunction = function () {
    //bind the user form controller by Angular JS
    var app = angular.module('users', []);
    app.controller('userController', userControllerFunc);
    //for check box --  add directive checked-list
    ezi.angular.addDirectiveCheckList(app);
    angular.bootstrap(angular.element("#sectionUsers"), ['users']);
}
