/**
* Bootstape Tree的封装版本.
* 需要SmartAdmin CSS支持
 **/
(function ($, window, document) {
    'use strict'

    var _ATTR_TREE_ID = "tree_id";
    var _DATA_TREE_NODE = "tree_data";
    var _DATA_TREE_OPTIONS = "tree_options";

    //Make a tree according to the bootstrap tree.
    //eziTree(options) : {data:treedata,render:new function(data,node)}  treedata: [{id:'1',text:'title',parentid:null}....]
    //eziTree("data",id): get tree data of the node which treeid = id
    //eziTree("add",id,data): add a tree node under the {id} and with {data}
    //eziTree("update",id,data): update a tree node by the {id} and with {data}
    //eziTree("remove",id): remove a tree node by the {id}
    $.fn.eziTree = function (options, id, data) {

        if ($.isPlainObject(options)) {
            if (!options || !options.data) { console.log("ezi tree needs a valid option to init : {data:array,render:function}"); return; }
            $(this).data(_DATA_TREE_OPTIONS, options);
            _renderTree(this, options);
            //start to make tree
            $(this).addClass("tree");
            _formatTree($(this));
            return;
        }

        //get the tree options in the root node to indicate the node is loaded the tree component.
        var treeoptions = $(this).data(_DATA_TREE_OPTIONS);
        if (treeoptions) {
            var $currentNode = $(this).find('li[' + _ATTR_TREE_ID + '="' + id + '"]');
            if (options == "data") {
                return $currentNode.data(_DATA_TREE_NODE);
            }
            if (options == "add") {
                treeoptions.data.push(data);//add the new data to array.
                //for root node , use root div as current node
                var $newNode = _renderTreeArray(data.parentid ? $currentNode : $(this), [data], treeoptions)[0];
                $newNode.hide().fadeIn("slow", function () { _formatTree($currentNode.parent()); });
            }
            if (options == "update") {
                _renderTreeItem($currentNode, data, treeoptions);
                $currentNode.css('color', 'red').animate({ color: 'black' }, 800, 'linear');
            }
            if (options == "remove") {
                //remove the data from the datasource. some redundant data will be left but won't effect.
                var dataIndex = treeoptions.data.indexOf(data);
                treeoptions.data.splice(dataIndex, 1);

                $($currentNode).fadeOut("slow", function () {
                    var $parentul = $currentNode.parent();
                    $currentNode.remove();
                    if ($parentul.children('li').length == 0) {
                        var $parentul2 = $parentul.parents('ul:first');
                        $parentul.remove();
                        _formatTree($parentul2);
                    }
                });
            }
            if (options == "destory") {
                //remove the data from the datasource. some redundant data will be left but won't effect.
                $(this).removeData(_DATA_TREE_OPTIONS);
                $(this).empty();
            }
            return;
        }

    }//ezi tree

    //format the node and its chilren to make a tree.
    var _formatTree = function ($parentNode) {

        $parentNode.children('ul').attr('role', 'tree').find('ul').attr('role', 'group');

        var $childrenli = $parentNode.find('li:has(ul)');
        $childrenli.addClass('parent_li').attr('role', 'treeitem').find(' > span').attr('title', 'Collapse this branch');
        $childrenli.off("click.ezitree");
        $childrenli.on('click.ezitree', ' > span', null, function (e) {
            var $this = $(this);
            var children = $this.parent('li.parent_li').find(' > ul > li');
            if (children.is(':visible')) {
                children.hide('fast');
                $this.attr('title', 'Expand this branch').find(' > i').addClass('icon-plus-sign').removeClass('icon-minus-sign');
            }
            else {
                children.show('fast');
                $this.attr('title', 'Collapse this branch').find(' > i').addClass('icon-minus-sign').removeClass('icon-plus-sign');
            }
            e.stopPropagation();
        });
     
        //clear empty li without any ul (no child)
        $parentNode.find('li:not(:has(ul))').removeClass('parent_li').removeAttr('role').off("click.ezitree").find(' > span').removeAttr('title').find(' > i').removeClass('icon-minus-sign').removeClass('icon-plus-sign');
    }

    //render the tree by options
    var _renderTree = function (rootnode, options) {
        if (!options.data) { console.log("ezi tree option doesn't have a data."); return;}
        var $root = $(rootnode);
        $root.empty();
        var rootdataarray = options.data.filter(function (item) { return item.parentid == null || item.parentid == "" });
        _renderTreeArray($root, rootdataarray, options);
        return $root;
    }

    //core render function of ezi tree
    var _renderTreeArray = function ($parentnode, dataarray , options) {
        var $ul = $parentnode.children("ul");
        if ($ul.length == 0) {
            $ul = $('<ul></ul>');
            $parentnode.append($ul);
        }
        var liarray = [];
        for (var i in dataarray) {
            // render the current items
            var $li = $('<li></li>');
            _renderTreeItem($li,dataarray[i],options);
    
            //render the children nodes
            var subdataarray = options.data.filter(function (item) { return item.parentid == dataarray[i].id });
            if (subdataarray.length > 0) _renderTreeArray($li, subdataarray, options);

            //append the li to parent ul
            $ul.append($li);
            liarray.push($li);
        }
        return liarray;
    }

    //the function to render every item
    var _renderTreeItem = function ($li, data, options) {
        if (!data) { console.log("ezi tree can't create item with null data."); return;}
        //set the data and attributte
        $li.attr(_ATTR_TREE_ID, data.id);
        $li.data(_DATA_TREE_NODE, data);
        //clear the orginal text elements and keep the ul if it's child nodes
        $li.children(":not(ul)").remove();
        //render the li
        if (options.render) {
            var rendercontent = '<i>'+options.render(data, $li[0])+'</i>';
            if (rendercontent) $li.prepend(rendercontent);
        }
        $li.prepend('<span><i class="fa fa-lg fa-' + data.icon + '"></i> ' + data.text + '</span>');
        //handle the render function
        return $li;
    }


})(jQuery, window, document);
