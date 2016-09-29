define([
	"esri/layers/ArcGISDynamicMapServiceLayer", "esri/geometry/Extent", "esri/SpatialReference", "esri/tasks/query", "esri/tasks/QueryTask",
	"esri/symbols/PictureMarkerSymbol", "dijit/TooltipDialog", "dijit/popup",
	"dojo/_base/declare", "framework/PluginBase", "esri/layers/FeatureLayer", "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol", "esri/lang", "esri/tasks/Geoprocessor",
	"esri/symbols/SimpleMarkerSymbol", "esri/graphic", "dojo/_base/Color", 	"dijit/layout/ContentPane", "dijit/form/HorizontalSlider", "dojo/dom",
	"dojo/dom-class", "dojo/dom-style", "dojo/dom-construct", "dojo/dom-geometry", "dojo/_base/lang", "dojo/on", "dojo/parser", 'plugins/water-quality/js/ConstrainedMoveable',
	"dojo/text!./varObject.json", "jquery", "dojo/text!./html/legend.html", "dojo/text!./html/content.html", 'plugins/water-quality/js/jquery-ui-1.11.2/jquery-ui', "esri/renderers/SimpleRenderer",
	"plugins/water-quality/chartist/chartist", "./test", "./test1", "./test2", "./impWatersheds",
],
function ( ArcGISDynamicMapServiceLayer, Extent, SpatialReference, Query, QueryTask, PictureMarkerSymbol, TooltipDialog, dijitPopup,
	declare, PluginBase, FeatureLayer, SimpleLineSymbol, SimpleFillSymbol, esriLang, Geoprocessor, SimpleMarkerSymbol, Graphic, Color,
	ContentPane, HorizontalSlider, dom, domClass, domStyle, domConstruct, domGeom, lang, on, parser, ConstrainedMoveable, config, $,
	legendContent, content, ui, SimpleRenderer, Chartist, test, test1, test2, impWatersheds ) {
        "use strict";

        return declare(null, {
            // doTest: function(t) {
				// t.wx = 'after';
				// t.test1 = new test1();
				// t.test1.doTest1();
            // },
			impWaterClick: function(t, l) {
				$('#' + t.id + 'chartHeader').text("Click on an Impaired Watershed");
				console.log('imp water click')
				t.obj.sel = 'imp';
				t.obj.visibleLayers = [3];
				t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				$('#' + t.id + 'home, #' + t.id + 'spatialWrapper, #' + t.id + 'huc8Wrapper').slideUp();
				$('#' + t.id + 'clearWrapper, #' + t.id + 'hucWrapper').slideDown();
				$('#' + t.id + 'bottomDiv').show();
				$(t.con).animate({ height: '470px', width: '350px' }, 250,
					l.hitch(t,function(){
						t.resize();
					})
				);
			},
			impSelectionComplete: function(f,t,l){
				//imp watershed selection symbol
				var impWaterShedSelectionN = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
						new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
						new Color([53, 154, 0]), 3),
						new Color([236,239,222,.15]));
				var impWaterShedSelectionL = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
						new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
						new Color([216,216,0]), 3),
						new Color([236,239,222,.15]));
				var impWaterShedSelectionM = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
						new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
						new Color([	216,144,0]), 3),
						new Color([236,239,222,.15]));
				var impWaterShedSelectionH = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
						new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
						new Color([216,0,0]), 3),
						new Color([236,239,222,.15]));
				if (t.obj.sel == 'imp'){
					var waterName = f.features[0].attributes.NAME;
					var waterDesc = f.features[0].attributes.DESCRIPTIO;
					var waterID = f.features[0].attributes.SUBSEGME_1;
					var allUse = f.features[0].attributes.AllUse;

					if (f.features[0].attributes.TMDL_Priority == 'N'){
						t.impWater.setSelectionSymbol(impWaterShedSelectionN);
					}
					if (f.features[0].attributes.TMDL_Priority == 'L'){
						t.impWater.setSelectionSymbol(impWaterShedSelectionL);
					}
					if (f.features[0].attributes.TMDL_Priority == 'M'){
						t.impWater.setSelectionSymbol(impWaterShedSelectionM);
					}
					if (f.features[0].attributes.TMDL_Priority == 'H'){
						t.impWater.setSelectionSymbol(impWaterShedSelectionH);
					}

					if (f.features[0].attributes.TMDL_Priority == 'N'){
						var html = $('#' + t.id + 'waterName').html("<b>Watershed Name:</b> " + waterName);
						var html = $('#' + t.id + 'waterDesc').html("<b>Watershed Description:</b> " + waterDesc);
						var html = $('#' + t.id + 'waterID').html("<b>Watershed ID:</b> " + waterID);
						$('#' + t.id + 'waterAttributes').slideDown();
						$('#' + t.id + 'impWaterWrapper').slideUp();

						if(f.features.length > 0){
							var xmax = t.map.extent.xmax;
							var xmin = t.map.extent.xmin;
							var impExtent = f.features[0].geometry.getExtent().expand(3);
							t.map.setExtent(impExtent, true);
						}
					}else{
						$('#' + t.id + 'impTable').empty();
						$('#' + t.id + 'impTable').append('<tr><th>Impairment</th><th>Suspected Cause</th><th>Suspected Source</th></tr>');
						var splitAllUse = allUse.split('],');
						var i;
						for (i = 0; i < splitAllUse.length; i++) {
							var item = splitAllUse[i];
							item = item.split(/['']/);
							$('#' + t.id + 'impTable').append('<tr class="tableRow"><td>' + item[1] + '</td> <td>' + item[3] + '</td> <td>' + item[5] + '</td></tr>');
						}
						$('#' + t.id + 'waterAttributes').slideDown();
						$('#' + t.id + 'impWaterWrapper').slideDown();
						var html = $('#' + t.id + 'waterName').html("<b>Watershed Name:</b> " + waterName);
						var html = $('#' + t.id + 'waterDesc').html("<b>Watershed Description:</b> " + waterDesc);
						var html = $('#' + t.id + 'waterID').html("<b>Watershed ID:</b> " + waterID);
						
						if(f.features.length > 0){
							var impExtent = f.features[0].geometry.getExtent().expand(3);
							t.map.setExtent(impExtent, true);
							t.shiftMapCenter(t.map.extent, f.features[0].geometry.getCentroid());
						}
					}
				}
			}
			
        });
    }
);