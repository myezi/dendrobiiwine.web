/**
* Ezi 的Menu的绑定的通用函数.
* 绑定的数据为下列对象的数组
  { "Link": "ajax/home.html", "Text": "系统首页", "Icon": "home", "Roles": null, "Subs": [ ] },
  ParentId为0的时候说明是根菜单
**/
(function ($, window, document) {
    'use strict'
   
    //以一个数组对象绑定一个菜单
    $.fn.bindMenus = function (allmenus) {
        this.append(_makeMenus(allmenus));
    };

    var _makeMenus = function (menus) {
        if (menus == null || menus.length == 0) return;

        var $parent = $("<ul></ul>");
        for (var i in menus) {
            var $link = $("<a></a>");
            $link.attr("href", menus[i].Link||"#");
            $link.append('<i class="fa fa-lg fa-fw fa-' + menus[i].Icon + '"></i> ');
            if(menus[i].Subs.length > 0)
                $link.append('<span class="menu-item-parent">' + menus[i].Text + '</span>');
            else
                $link.append(menus[i].Text);
            var $li = $("<li></li>");
            $li.append($link);

            //处理子菜单
            $li.append(_makeMenus(menus[i].Subs));
            $li.appendTo($parent);
        }
        return $parent;
    }

  
})(jQuery, window, document);
