
$(document).ready(function () {
    //绑定页面按钮事件
    $("body").on("keydown", keyLogin);

    //加载项目配置信息
    ezi.getjson(API_APP_GETAPPINFO, function (app) {
        $("#fullName").text(app.CompanyName);
        $("#shortName").text(app.CompanyName);
        document.title = app.Name;
    });
});


function login() {

    var name = $("#name").val();
    var pass = $("#pass").val();

    if (name == "" || pass == "") {
        ezi.msg.warning("用户名和密码不能为空!");
    } else
        ezi.ajax({
            type: "POST",
            url: API_ACCOUNT_LOGIN,
            data: { name: name, pass: pass },
            homeiferror: false,
            success: function (result) {
                if (result.status)
                    window.location = "index.html#ajax/home.html";
                else
                    ezi.msg.warning(result.message);
            }
        });
}

//实现回车直接登录功能
function keyLogin(e) {
    if (e.which == 13) {
        e.preventDefault();
        //login();
        $("#btnLogin").click();
    }
}

//忘记密码功能
function forgotPassword() {
    var name = $("#name").val();
    if (name == "") {
        ezi.msg.warning("Please input the UserName firstly.");
    } else
        ezi.ajax({
            url: API_ACCOUNT_MAKERESETTOKEN,
            data: { name: name },
            homeiferror: false,
            success: function (result) {
                if (result.status) {
                    var link = '<a href="/resetpassword.html?v=' + encodeURI(result.Data) + '">Click here to reset password page.</a>';
                    ezi.msg.success(result.message, link);
                }
                else
                    ezi.msg.warning(result.message);
            }
        });
}
