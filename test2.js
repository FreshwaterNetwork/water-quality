define([
        "dojo/_base/declare"
    ],
    function(declare) {
        "use strict";

        return declare(null, {
			doTest2: function() {
				console.log('doTest2');
			},
			
			// shiftMapCenter: function(div) {
				// console.log(this.map);
				// var extent = this.map.extent;
				// console.log(extent, 'extent');
				// var x = (extent.xmax + extent.xmin)/2;
				// var y = (extent.ymax + extent.ymin)/2;

				// var offset = map.getResolution() * dojo.style(div,"width")/2;
				// var point = new esri.geometry.Point(x - offset, y, map.spatialReference);
				// map.centerAt(point);
			// },
			impWaterClick: function(){
				console.log(window.innerWidth, 'inner width from test 2.js');
				//console.log(this.map.getResolution());
				// $('#' + this.id + 'chartHeader').text("Please click on an impaired watershed for more info");
				// this.obj.sel = 'imp';
				// this.obj.visibleLayers = [3];
				// this.dynamicLayer.setVisibleLayers(this.obj.visibleLayers);
				// $('#' + this.id + 'home, #' + this.id + 'spatialWrapper, #' + this.id + 'huc8Wrapper').slideUp();
				// $('#' + this.id + 'clearWrapper, #' + this.id + 'hucWrapper').slideDown();
				// $('#' + this.id + 'bottomDiv').show();
				// $(this.con).animate({ height: '480px', width: '600px' }, 250,
					// lang.hitch(this,function(){
						// this.resize();
					// })
				// );
			}
			
			
        });
    }
);