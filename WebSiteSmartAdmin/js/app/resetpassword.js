
$(document).ready(function () {
    //加载项目配置信息
});


function resetPassword() {

    var token = ezi.getQueryString("v");
    var pass = $("#newpass").val();

    if (pass == "") {
        ezi.msg.warning("Please enter the new password!");
    } else
        ezi.ajax({
            type: "POST",
            url: "/api/account/ResetPasswordByToken",
            data: { token: token, password: pass },
            homeiferror: false,
            success: function (result) {
                if (result.status)
                    ezi.msg.warning("Password has been reset,please login again.", "", function () {
                        window.location = "login.html";
                    });
                else
                    ezi.msg.warning(result.message);
            }
        });
}
