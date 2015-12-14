
$(document).ready(function () {

    //设定Refresh函数
    $('#refresh').on("click.refresh", function () {
        ezi.msg.confirm("是否立刻刷新当前页面?", "未保存的数据会在刷新操作后丢失,请先保存已修改数据!", function () {
            //触发当前菜单点击事件
            checkURL();
        });
    });

    //远程加载登陆信息
    ezi.getjson(API_ACCOUNT_GETCURRENTLOGIN, function (user) {
        //改为knockout bind - 必须用准确的ID定位到区域,避开Main Content区域
        $("#txtName").text(user.Name);
        $("#txtRoles").text(user.Roles);

        //绑定当前登录的菜单项
        $("#left-panel nav").bindMenus(user.Menus);
        checkURL();
        initApp.leftNav();

    });

    //加载项目配置信息
    ezi.getjson(API_APP_GETAPPINFO, function (app) {
        $("#appName").text(app.Name);
    });

})


//Logout函数
function Logout() {
    ezi.msg.confirm("是否确认登出系统?", "", function () {
        ezi.getjson(API_ACCOUNT_LOGOUT, function (result) {
            if (result) window.location = "/login.html";
        });
    });
}