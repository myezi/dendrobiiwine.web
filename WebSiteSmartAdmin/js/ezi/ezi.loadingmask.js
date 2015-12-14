// Background color parameter
$.extend($.fn, {
        loadingmask: function (msg) {
            this.unloadingmask();

            var $original = this;
            var maskclass = "ezi_loadingmask";
         
            // 创建一个 Mask 层，追加到对象中
            var $maskDiv = $('<div></div>');
            $maskDiv.addClass(maskclass);
            $maskDiv.appendTo($original);
     
			if (typeof (msg) == 'undefined' || msg == null || msg == "") msg = "Loading...";
    
            //Redraw the Mask : first : first time to show the mask not for resizing.
            var _redrawMask = function(first) {

                var webezimaskop = { opacity: 0.8, z: 10000, bgcolor: '#ccc'};
                var position = { top: 0, left: 0 };
  
                var maskWidth = $original.outerWidth();
                if (!maskWidth) maskWidth = $original.width();
                var maskHeight = $original.outerHeight();
                if (!maskHeight) maskHeight = $original.height();

                //return if the size is same as original one to save time for redundancy resizing.
                if ($maskDiv.width() == maskWidth && $maskDiv.height() == maskHeight) return;

                $maskDiv.empty();
                $maskDiv.css({
                    position: 'absolute',
                    top: position.top,
                    left: position.left,
                    'z-index': webezimaskop.z,
                    width: maskWidth,
                    height: maskHeight,
                    'background-color': webezimaskop.bgcolor,
                    opacity: 0
                });

                if (msg) {
                    var $msgDiv = $('<div style="position:absolute;padding:2px;background:#ccca"><h1><i class="fa fa-cog fa-spin"></i> ' + msg + '</h2></div>');
                    $msgDiv.appendTo($maskDiv);
                    var widthspace = ($maskDiv.width() - $msgDiv.width());
                    var heightspace = ($maskDiv.height() - $msgDiv.height());
                    $msgDiv.css({
                        //cursor: 'wait',
                        top: 300,//(heightspace / 2 - 2),
                        left: (widthspace / 2 - 2)
                    });
                }

                if (first)//第一次显示需要淡入效果,其他就不需要了
                    $maskDiv.fadeTo('fast', webezimaskop.opacity);
                else
                    $maskDiv.fadeTo(0, webezimaskop.opacity);
            }

            //Draw the Mask
            _redrawMask(true);
      
            $(window).resize(function () {
                _redrawMask(false);
            });

            return $maskDiv;
        },
        unloadingmask: function () {
            $(this).find("div.ezi_loadingmask").remove();
        }
    });



