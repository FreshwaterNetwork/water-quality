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
                console.log('graph clicks');
            },
			supRadioClick: function(t, c){
				console.log('sup data click')
				//var map = t.map
				// write a function here to see if the layers exist, if they do remove them
				$('#' + t.id + 'clickHuc12').hide();
				$('#' + t.id + 'clickHuc12').html('');
				$('#' + t.id + 'clickSoils').hide();
				$('#' + t.id + 'clickSoils').html('');
				t.map.graphics.clear();
				t.soils.clear();
				t.huc12.clear();
				// make an array to loop through soils layers
				var supDataArray = [1,8,9,10,11,12,13]
				$.each(supDataArray, lang.hitch(t, function(i,v){
					var index = t.obj.spatialLayerArray.indexOf(v);
					if(index > -1){
						t.obj.spatialLayerArray.splice(index,1);
					}
					var index = t.obj.visibleLayers.indexOf(v);
					if(index > -1){
						t.obj.visibleLayers.splice(index,1);
					}
				}));
				// if value is Huc 12 set the layer to on
				if (c.currentTarget.value == "HUC 12s"){
					console.log('huc 12 click')
					t.obj.spatialLayerArray.push(1);
					t.obj.visibleLayers.push(1);
					t.obj.supLayer = "cb-huc12";
					t.obj.layerDefs[1] = "HUC_8 = '" + t.obj.huc8Selected[1] +"'";
					t.dynamicLayer.setLayerDefinitions(t.obj.layerDefs);
					if (t.obj.visibleLayers.length < 2 ){
						$('#' + t.id + 'bottomDiv').hide();
					}
				}
				// if value is soils set the layer to on
				if (c.currentTarget.value == "Soils Data"){
					console.log('soils click')
					t.obj.supLayer = "cb-soils"
					t.obj.soilID = '';
					var soilLayer = t.obj.huc8Selected[0] + '_soils' + "_web";
					$.each(t.layersArray, lang.hitch(t,function(i,v){
						var layerName = v.name;
						if (t.obj.huc8Selected[0] + '_soils' + "_web" == layerName){
							t.obj.soilID = v.id;
							t.obj.spatialLayerArray.push(t.obj.soilID);
							t.obj.visibleLayers.push(t.obj.soilID);
							return false;
						}
					}));
					if (t.obj.visibleLayers.length < 2 ){
						$('#' + t.id + 'bottomDiv').hide();
					}
				}
				if (c.currentTarget.value == "Land Cover"){
					console.log('land cover click')
					t.obj.supLayer = 'cb-land';
					var landID = '';
					$.each(t.layersArray, lang.hitch(t,function(i,v){
						if (t.obj.huc8Selected[0] + ' Land Cover' == v.name){
							landID = v.id;
							t.obj.spatialLayerArray.push(landID);
							t.obj.visibleLayers.push(landID);
							return false;
						}
					}));
					$('#' + t.id + 'bottomDiv').show();
				}
				if (c.currentTarget.value == "None"){
					t.obj.supLayer = 'none';
					if (t.obj.visibleLayers.length < 2 ){
						$('#' + t.id + 'bottomDiv').hide();
					}
				}
				t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				console.log('end of sup data');
			},
			supDataFunction: function(t, f){
				console.log(t.hQuery, 'hq');
				var id = t.id;
				t.soils.clear();
				t.huc12.clear();
				if(t.obj.supLayer == 'none' || t.obj.supLayer == 'cb-land'){
					t.huc8_click.selectFeatures(t.hQuery,esri.layers.FeatureLayer.SELECTION_NEW);
				}
				if (t.obj.supLayer == 'cb-huc12'){
					t.hQuery.where = "HUC_8 = '" + t.obj.huc8Selected[1] + "'";
					t.huc12.selectFeatures(t.hQuery,esri.layers.FeatureLayer.SELECTION_NEW);
				}
				if (t.obj.supLayer == 'cb-soils'){
					var soilsUrl = t.obj.url + "/" + t.obj.soilID;
					t.soils = new FeatureLayer(soilsUrl, { mode: esri.layers.FeatureLayer.MODE_SELECTION, outFields: "*"});
					t.soils.setSelectionSymbol(t.soilsSym);
					t.map.addLayer(t.soils);
					t.soils.selectFeatures(t.hQuery,esri.layers.FeatureLayer.SELECTION_NEW);
					// handle the on selection complete here after the add layer
					t.soils.on("selection-complete", lang.hitch(t,function(f){
						if (f.features.length > 0){
							$('#' + id + 'clickSoils').show();
							var c = "<div class='supDataText' style='padding:6px;'><b>Soil Type: </b>${Map_unit_n}</div>";
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
			}
			
        });
    }
);
	