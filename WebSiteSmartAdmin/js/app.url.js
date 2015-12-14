//所有应用Ajax Url统一设置的配置信息代码
var API_APP_BASE = "http://localhost:8888/";

//获取应用的一些信息
var API_APP_GETAPPINFO = API_APP_BASE + "api/default/getappinfo";
//登录系统
var API_ACCOUNT_LOGIN = API_APP_BASE + "api/account/login";
//登出
var API_ACCOUNT_LOGOUT = API_APP_BASE + "api/account/logout";
//获取当前登录信息
var API_ACCOUNT_GETCURRENTLOGIN = API_APP_BASE + "api/account/getcurrentlogin";

//var API_ACCOUNT_MAKERESETTOKEN = "/api/account/MakeResetPasswordTokenByName";

//==========用户管理功能==============
var API_USER_GETALL = API_APP_BASE + "api/user/getallusers";
var API_USER_GETALLROLE = API_APP_BASE + "api/user/getallroles";
var API_USER_SAVE = API_APP_BASE + "api/user/saveuser";
var API_USER_DELETE = API_APP_BASE + "api/user/deleteuser";
//==========用户管理功能==============