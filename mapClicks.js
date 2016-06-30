define([
	"esri/layers/ArcGISDynamicMapServiceLayer", "esri/geometry/Extent", "esri/SpatialReference", "esri/tasks/query", "esri/tasks/QueryTask",
	"esri/symbols/PictureMarkerSymbol", "dijit/TooltipDialog", "dijit/popup",
	"dojo/_base/declare", "framework/PluginBase", "esri/layers/FeatureLayer", "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol", "esri/lang", "esri/tasks/Geoprocessor",
	"esri/symbols/SimpleMarkerSymbol", "esri/graphic", "dojo/_base/Color", 	"dijit/layout/ContentPane", "dijit/form/HorizontalSlider", "dojo/dom",
	"dojo/dom-class", "dojo/dom-style", "dojo/dom-construct", "dojo/dom-geometry", "dojo/_base/lang", "dojo/on", "dojo/parser", 'plugins/water-quality/js/ConstrainedMoveable',
	"dojo/text!./varObject.json", "jquery", "dojo/text!./html/legend.html", "dojo/text!./html/content.html", 'plugins/water-quality/js/jquery-ui-1.11.2/jquery-ui', "esri/renderers/SimpleRenderer",
	"plugins/water-quality/chartist/chartist", "./test", "./test1", "./test2",
],
function ( ArcGISDynamicMapServiceLayer, Extent, SpatialReference, Query, QueryTask, PictureMarkerSymbol, TooltipDialog, dijitPopup,
	declare, PluginBase, FeatureLayer, SimpleLineSymbol, SimpleFillSymbol, esriLang, Geoprocessor, SimpleMarkerSymbol, Graphic, Color,
	ContentPane, HorizontalSlider, dom, domClass, domStyle, domConstruct, domGeom, lang, on, parser, ConstrainedMoveable, config, $,
	legendContent, content, ui, SimpleRenderer, Chartist, test, test1, test2) {
        "use strict";

        return declare(null, {
			mapClick: function(evt, t){
				console.log('map click')
				var pnt = evt.mapPoint;
				t.hQuery = new esri.tasks.Query();
				t.hQuery.geometry = pnt;
				
				
				if (t.obj.sel == 'tm' && t.sSelected == 'map'){
					t.supportingData.supDataFunction(t);
				}
				if (t.obj.sel == 'sp'){
					t.supportingData.supDataFunction(t);
				}
				if (t.obj.sel == 'imp'){
					console.log('imp water section');
					// select features from the imp water layer.
					t.impWater.selectFeatures(t.hQuery,esri.layers.FeatureLayer.SELECTION_NEW);
				}
				t.sSelected = 'map';
			},
			huc8SelComplete: function(f,t){
				console.log('huc 8 sel complete');
				if(f.features.length > 0){
					if(t.obj.huc8Selected[0] == 'Merm'){
						var huc8Extent = f.features[0].geometry.getExtent().expand(1);
					}else{
						var huc8Extent = f.features[0].geometry.getExtent().expand(0.9);
					}
					t.map.setExtent(huc8Extent, true);
				}
			},
			huc8ClickSelComplete: function(f,t){
				console.log('huc 8 click sel complete');
				if(f.features.length > 0){
					// only allow a trigger of the dropdown menu if it has not been selected
					if(f.features[0].attributes.Abbr == t.obj.huc8Selected[0]){
						console.log('t huc8 has already been selected');
					}else{
						var huc8ClickVal = f.features[0].attributes.Abbr + '_' + f.features[0].attributes.HUC_8;
						$('#' + t.id + 'ch-HUC8').val(huc8ClickVal).trigger('chosen:updated').trigger('change');
					}
				} else{
					console.log('you did not click on a huc8 and did not activate a huc 8 click');
				}
			},
			huc12SelComplete: function(f,t){
				console.log('huc 12 sel complete');
				// function numberWithCommas(x) {
					// return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
				// }
				if(f.features.length > 0){
					console.log('look here is f lenghth is more than 0', '#' + t.id + 'clickHuc12');
					$('#' + t.id + 'clickHuc12').show();
					var acres = numberWithCommas(f.features[0].attributes.ACRES);
					var t = "<div class='supDataText' style='padding:6px;'><b>HUC 12: </b>${HUC_12}<br><b>Acres: </b>" + acres + "<br><b>Subwatershed: </b>${SUBWATERSHED}</div>";
					var content = esriLang.substitute(f.features[0].attributes,t);
					console.log(content ,'content');
					$('#' + t.id + 'clickHuc12').html(content);
				}else{
					var query = new esri.tasks.Query();
					query.geometry = t.hQuery.geometry;
					t.huc8_click.selectFeatures(query,esri.layers.FeatureLayer.SELECTION_NEW);
				}
			},
			impSelectionComplete: function(f,t,l){
				console.log(f.features[0], 'features')
				// imp watershed selection symbol
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
						console.log('no data in t imp watershed');
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
							console.log(f.features[0].geometry.getExtent());
							
							var impExtent = f.features[0].geometry.getExtent().expand(3);
							t.map.setExtent(impExtent, true);
							t.shiftMapCenter(t.map.extent, f.features[0].geometry.getCentroid());
						}
					}
				}
			},
			shiftMapCenter: function(extent, featCentroid) {
				console.log(extent, 'extent', featCentroid, 'feature centroid');
				var extentDiff = extent.xmin - extent.xmax;
				extentDiff = extentDiff * .10; // 10 percent difference
				console.log(Math.abs(extentDiff), 'diff');
				var newCentroidX = featCentroid.x + Math.abs(extentDiff);
				console.log(newCentroidX, 'new centroid');
				var point = new esri.geometry.Point(newCentroidX, featCentroid.y, this.map.spatialReference);
				console.log(point, 'point');
				this.map.centerAt(point);
				console.log(this.map.centroid)
				
				
				
				
				// var screenWidth = window.innerWidth;
				// var conWidth = Number(this.con.style.width.slice(0,-2));
				// var leftDivEdge = 70 + 85 + conWidth;
				// console.log(leftDivEdge, screenWidth);
				// if (screenWidth < 1800){
					// console.log('screen is less than 1800px');
				// }
			},
        });
    }
);





