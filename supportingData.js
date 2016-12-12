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
	legendContent, content, ui, SimpleRenderer, Chartist, test, test1, test2 ) {
        "use strict";

        return declare(null, {
            doTest: function(t) {
            },
			supRadioClick: function(t, c){
				console.log(c,'c 2');
				if(t.bankChecked == 'yes'){
					t.map.removeLayer(t.bank);
				}
				// write a function here to see if the layers exist, if they do remove them
				$('#' + t.id + 'clickHuc12').hide();
				$('#' + t.id + 'clickHuc12').html('');
				$('#' + t.id + 'clickSoils').hide();
				$('#' + t.id + 'clickSoils').html('');
				$('#' + t.id + 'clickBank').hide();
				$('#' + t.id + 'clickBank').html('');
				$('#' + t.id + 'clickStreams').hide();
				$('#' + t.id + 'clickStreams').html('');
				t.map.graphics.clear();
				t.soils.clear();
				t.huc12.clear();
				t.map.removeLayer(t.streams);
				// make an array to loop through sup data layers and clear on each radio click
				$.each(t.supDataArray, lang.hitch(t, function(i,v){
					var index2 = $.inArray(v, t.obj.spatialLayerArray);
					var index3 = $.inArray(v, t.obj.visibleLayers);
					if(index2 > -1){
						t.obj.spatialLayerArray.splice(index2,1);
					}
					if(index3 > -1){
						t.obj.visibleLayers.splice(index3,1);
					}
				}));
				// if value is Huc 12 set the layer to on
				if (c.currentTarget.value == "cb-huc12"){
					console.log('huc 12 area')
					t.obj.spatialLayerArray.push(1);
					t.obj.visibleLayers.push(1);
					t.obj.supLayer = "cb-huc12";
					t.obj.layerDefs[1] = "huc8_abbr = '" + t.huc8Choosen +"'";
					t.dynamicLayer.setLayerDefinitions(t.obj.layerDefs);
					if (t.obj.visibleLayers.length < 2 ){
						$('#' + t.id + 'bottomDiv').hide();
					}
				}
				// if value is soils set the layer to on
				if (c.currentTarget.value == "cb-soils"){
					t.obj.spatialLayerArray.push(7);
					t.obj.visibleLayers.push(7);
					t.obj.supLayer = "cb-soils"
					t.obj.layerDefs[7] = "Watershed = '" + t.huc8Choosen +"'";
					t.dynamicLayer.setLayerDefinitions(t.obj.layerDefs);
					if (t.obj.visibleLayers.length < 2 ){
						$('#' + t.id + 'bottomDiv').hide();
					}
				}
				if (c.currentTarget.value == "cb-streams"){
					t.streamsChecked = 'yes'
					t.obj.supLayer = 'cb-streams';
					t.obj.spatialLayerArray.push(6);
					t.obj.visibleLayers.push(6);
					t.obj.supLayer = "cb-streams"
					t.obj.layerDefs[6] = "Watershed = '" + t.huc8Choosen +"'";
					t.dynamicLayer.setLayerDefinitions(t.obj.layerDefs);
					$('#' + t.id + 'bottomDiv').show();
				}
				if (c.currentTarget.value == "cb-bank"){
					// get count for mitigation banks
					var query = new Query();
					var queryTask = new QueryTask(t.obj.url + '/5');
					query.where =  "Watershed = '" + t.huc8Choosen +"'";
					console.log('before bank count')
					queryTask.executeForCount(query,function(count){
						if(count <= 0){
							$('#' + t.id + 'clickBank').show();
							var c = "<div class='supDataText' style='padding:6px;'>There are no mitigation banks for this watershed</div>";
							$('#' + t.id + 'clickBank').html(c);
						}	
					});
					
					t.bankChecked = 'yes';
					t.obj.supLayer = 'cb-bank';
					t.obj.spatialLayerArray.push(5);
					t.obj.visibleLayers.push(5);
					t.obj.layerDefs[5] = "Watershed = '" + t.huc8Choosen +"'";
					t.dynamicLayer.setLayerDefinitions(t.obj.layerDefs);
					if (t.obj.visibleLayers.length < 2 ){
						$('#' + t.id + 'bottomDiv').hide();
					}
					$('#' + t.id + 'bottomDiv').show();
				}
				
				if (c.currentTarget.value == "cb-land"){
					t.obj.supLayer = 'cb-land';
					var landID = '';
					$.each(t.layersArray, lang.hitch(t,function(i,v){
						if ('Land Cover - ' + t.huc8CleanName == v.name){
							landID = v.id;
							t.obj.spatialLayerArray.push(landID);
							t.obj.visibleLayers.push(landID);
							return false;
						}
					}));
					$('#' + t.id + 'bottomDiv').show();
				}
				if (c.currentTarget.value == "cb-none"){
					t.obj.supLayer = 'cb-none';
					if (t.obj.visibleLayers.length < 2 ){
						$('#' + t.id + 'bottomDiv').hide();
					}
				}
				
				// reset the raster layer def in the sup data area.
				if (t.obj.sel == 'sp' && t.obj.year.length > -1){
					t.layerDefinitions = [];
					t.obj.layerDefs[t.lyrID] = "Watershed = '" + t.huc8Choosen + "' AND Year ='" + t.obj.year + "'";
					t.dynamicLayer.setLayerDefinitions(t.obj.layerDefs);
					t.obj.visibleLayers.push(t.lyrID);
				}
				
				// console.log(t.obj.visibleLayers, '2');
				
				t.obj.visibleLayers = unique(t.obj.visibleLayers);
				t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
			},
			supDataFunction: function(evt,t){
				var id = t.id;
				t.soils.clear();
				t.huc12.clear();
				t.bank.clear();
				t.streams.clear();
				t.map.graphics.clear();
				
				if(t.obj.supLayer == 'cb-none' || t.obj.supLayer == 'cb-land'){
					t.huc8_click.selectFeatures(t.hQuery,esri.layers.FeatureLayer.SELECTION_NEW);
				}
				if(t.obj.supLayer == 'cb-bank'){
					var bankURL  = t.obj.url + '/5';
					t.bank = new FeatureLayer(bankURL, { mode: esri.layers.FeatureLayer.MODE_SELECTION, outFields: "*"}); 
					t.bank.setSelectionSymbol(t.bankSym);
					t.map.addLayer(t.bank);
					
					var centerPoint = new esri.geometry.Point(evt.mapPoint.x,evt.mapPoint.y,evt.mapPoint.spatialReference);
					var mapWidth = t.map.extent.getWidth();
					var mapWidthPixels = t.map.width;
					var pixelWidth = mapWidth/mapWidthPixels;
					var tolerance = 20 * pixelWidth;
					var pnt = evt.mapPoint;
					var ext = new esri.geometry.Extent(1,1, tolerance, tolerance, evt.mapPoint.spatialReference);
					var q = new Query();
					q.geometry = ext.centerAt(centerPoint);
					t.bank.selectFeatures(q,esri.layers.FeatureLayer.SELECTION_NEW);
					
						
					
					// handle the on selection complete here after the add layer for bank
					t.bank.on("selection-complete", lang.hitch(t,function(f){
						if (f.features.length > 0){
							$('#' + id + 'clickBank').show();
							var c = "<div class='supDataText' style='padding:6px;'><b>Bank Name: </b>${Name}</div>";
							var content = esriLang.substitute(f.features[0].attributes,c);
							$('#' + id + 'clickBank').html(content);
						}else{
							var query = new esri.tasks.Query();
							query.geometry = t.hQuery.geometry;
							t.huc8_click.selectFeatures(query,esri.layers.FeatureLayer.SELECTION_NEW);
						}
					}));
				};
				
				if(t.obj.supLayer == 'cb-streams'){
					var streamsURL  = t.obj.url + "/6";
					t.streams = new FeatureLayer(streamsURL, { mode: esri.layers.FeatureLayer.MODE_SELECTION, outFields: "*"}); 
					t.streams.setSelectionSymbol(t.streamsSym);
					t.map.addLayer(t.streams);
					var centerPoint = new esri.geometry.Point(evt.mapPoint.x,evt.mapPoint.y,evt.mapPoint.spatialReference);
					var mapWidth = t.map.extent.getWidth();
					var mapWidthPixels = t.map.width;
					var pixelWidth = mapWidth/mapWidthPixels;
					var tolerance = 10 * pixelWidth;
					var pnt = evt.mapPoint;
					var ext = new esri.geometry.Extent(1,1, tolerance, tolerance, evt.mapPoint.spatialReference);
					var q = new Query();
					q.geometry = ext.centerAt(centerPoint);
					t.streams.selectFeatures(q,esri.layers.FeatureLayer.SELECTION_NEW);
					
					//t.streams.selectFeatures(t.hQuery, { mode: esri.layers.FeatureLayer.MODE_SELECTION, outFields: "*"});
					t.streams.on("selection-complete", lang.hitch(t,function(f){
						if (f.features.length > 0){
							$('#' + id + 'clickStreams').show();
							var c = "<div class='supDataText' style='padding:6px;'><b>Stream Name: </b>${GNIS_Name}</div>";
							var content = esriLang.substitute(f.features[0].attributes,c);
							$('#' + id + 'clickStreams').html(content);
						}else{
							var query = new esri.tasks.Query();
							query.geometry = t.hQuery.geometry;
							t.huc8_click.selectFeatures(query,esri.layers.FeatureLayer.SELECTION_NEW);
						}
					}));
				}
				
				if (t.obj.supLayer == 'cb-huc12'){
					t.hQuery.where = "huc8_abbr = '" + t.huc8Choosen + "'";
					t.huc12.selectFeatures(t.hQuery,esri.layers.FeatureLayer.SELECTION_NEW);
					t.huc12.on("selection-complete", lang.hitch(t,function(f){
						if(f.features.length > 0){
							$('#' + t.id + 'clickHuc12').show();
							var acres = numberWithCommas(f.features[0].attributes.ACRES);
							var c = "<div class='supDataText' style='padding:6px;'><b>HUC 12: </b>${HUC_12}<br><b>Acres: </b>" + acres + "<br><b>Subwatershed: </b>${SUBWATERSHED}</div>";
							var content = esriLang.substitute(f.features[0].attributes,c);
							$('#' + t.id + 'clickHuc12').html(content);
						}else{
							var query = new esri.tasks.Query();
							query.geometry = t.hQuery.geometry;
							t.huc8_click.selectFeatures(query,esri.layers.FeatureLayer.SELECTION_NEW);
						}
					}));
					
				}
				if (t.obj.supLayer == 'cb-soils'){
					var soilsUrl = t.obj.url + "/7";
					t.soils = new FeatureLayer(soilsUrl, { mode: esri.layers.FeatureLayer.MODE_SELECTION, outFields: "*"});
					t.soils.setSelectionSymbol(t.soilsSym);
					t.map.addLayer(t.soils);
					t.hQuery.where = "Watershed = '" + t.huc8Choosen + "'";
					t.soils.selectFeatures(t.hQuery,esri.layers.FeatureLayer.SELECTION_NEW);
					// handle the on selection complete here after the add layer
					t.soils.on("selection-complete", lang.hitch(t,function(f){
						if (f.features.length > 0){
							$('#' + id + 'clickSoils').show();
							var c = "<div class='supDataText' style='padding:6px;'><b>Soil Type: </b>${map_unit_n}</div>";
							var content = esriLang.substitute(f.features[0].attributes,c);
							$('#' + id + 'clickSoils').html(content);
						}else{
							var query = new esri.tasks.Query();
							query.geometry = t.hQuery.geometry;
							t.huc8_click.selectFeatures(query,esri.layers.FeatureLayer.SELECTION_NEW);
						}
						t.obj.soilStateID = f.features[0].attributes.OBJECTID;
					}));
				}
			},
        });
    }
);
	