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
            doTest: function(t) {
            },
			internalSpatialClick: function(t){
				if(t.containsNumber == 'no'){
					//$('#' + t.id + 'noDataText').show();
				}
				t.obj.graphOpen = '';
				t.obj.sel = 'sp';
				$('#' + t.id + 'temporalWrapper').hide();
				$('#' + t.id + 'graphHide, #' + t.id + 'graphShow').hide();
				$('#' + t.id + 'spatialWrapper').show();
				// remove water quality sample station points when click on internal spatial.
				//var index = t.obj.spatialLayerArray.indexOf(2);
				var index = $.inArray(2, t.obj.spatialLayerArray);
				if(index > -1){
					t.obj.spatialLayerArray.splice(index,1);
				}
				// remove sampling stations when internal spatial is clicked.
				t.map.removeLayer(t.samplingStations);
				// push year is to spatial array if year has been selected.
				if (t.obj.yearSelected != undefined){
					t.obj.spatialLayerArray.push(Number(t.lyrID));
				}
				t.obj.spatialLayerArray = unique(t.obj.spatialLayerArray);
				t.obj.visibleLayers = t.obj.spatialLayerArray;
				t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				// show and hide elements
				$('#' + t.id + 'graphHide').trigger('click');
				$('#' + t.id + 'chartHeader').text("Please choose or click on a HUC8");
				// update css to show that it is clicked
				$('#' + t.id + 'spaBtn').addClass('navBtnSel');
				$('#' + t.id + 'temBtn').removeClass('navBtnSel');
				t.map.graphics.clear();
				t.map.removeLayer(t.samplingStations);

				$(t.con).animate({ height: '565px', width: '350px' }, 250,
					lang.hitch(t,function(){
						t.resize();
					})
				);
			},
			internalTemporalClick: function(t){
				//$('#' + t.id + 'noDataText').hide();
				// update css to show that it is clicked
				$('#' + t.id + 'temBtn').addClass('navBtnSel');
				$('#' + t.id + 'spaBtn').removeClass('navBtnSel');
				t.obj.sel = "tm"
				$('#' + t.id + 'spatialWrapper, #' + t.id + 'graphDiv').hide();
				$('#' + t.id + 'graphHide, #' + t.id + 'graphShow').hide();
				$('#' + t.id + 'temporalWrapper, #' + t.id + 'showGraphText').show();
				// remove spatial raster layer when internal temporal button is clicked
				var stationIndex = t.obj.visibleLayers.indexOf(0);
				// if there is a huc 8 selected. show water quality sample points.
				if(t.obj.huc8Selected.length > 0){
					//t.obj.visibleLayers.push(0)
					t.map.addLayer(t.samplingStations);
				}
				var yearIndex = t.obj.visibleLayers.indexOf(Number(t.lyrID));
				if(yearIndex > -1){
					// t.obj.visibleLayers = [2,0];
					t.obj.visibleLayers.splice(yearIndex,1, 0);
				}
				t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				$(t.con).animate({ height: '485px', width: '350px' }, 250,
					lang.hitch(t,function(){
						t.resize();
					})
				);
			},
			spatialClick: function(t){
				t.obj.graphOpen = '';
				// update css to show that it is clicked
				$('#' + t.id + 'spaBtn').addClass('navBtnSel');
				$('#' + t.id + 'temBtn').removeClass('navBtnSel');
				t.obj.sel = "sp"
				t.map.removeLayer(t.samplingStations);
				$('#' + t.id + 'graphHide, #' + t.id + 'graphShow').hide();
				$('#' + t.id + 'home').slideUp();
				$('#' + t.id + 'topWrapper, #' + t.id + 'hucWrapper, #' + t.id + 'huc8Wrapper').slideDown();
				//t.addHuc8();
				t.obj.visibleLayers = [0];
				t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				$(t.con).animate({ height: '565px', width: '350px' }, 250,
					lang.hitch(t,function(){
						t.resize();
					})
				);
			},
			temporalClick: function(t){
				//update css to show that it is clicked
				$('#' + t.id + 'temBtn').addClass('navBtnSel');
				$('#' + t.id + 'spaBtn').removeClass('navBtnSel');
				t.obj.sel = "tm"
				t.obj.visibleLayers = [0,2];
				t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				$('#' + t.id + 'graphDiv').hide();
				$('#' + t.id + 'graphHide, #' + t.id + 'graphShow, #' + t.id + 'graphDiv').hide();
				$('#' + t.id + 'home, #' + t.id + 'spatialWrapper').slideUp();
				$('#' + t.id + 'showGraphText').show();
				$('#' + t.id + 'topWrapper, #' + t.id + 'hucWrapper, #' + t.id + 'temporalWrapper, #' + t.id + 'huc8Wrapper').slideDown();
				$(t.con).animate({ height: '485px', width: '350px' }, 250,
					lang.hitch(t,function(){
						t.resize();
					})
				);
			},
			impWaterClick: function(t, l) {
				t.map.addLayer(t.impWater);
				$('#' + t.id + 'chartHeader').text("Impaired Watershed");
				t.obj.sel = 'imp';
				t.obj.visibleLayers = [3];
				t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				$('#' + t.id + 'home, #' + t.id + 'spatialWrapper, #' + t.id + 'huc8Wrapper').slideUp();
				$('#' + t.id + 'clearWrapper, #' + t.id + 'hucWrapper, #' + t.id + 'impStartText').slideDown();
				$('#' + t.id + 'bottomDiv').show();
				$(t.con).animate({ height: '485px', width: '500px' }, 250,
					l.hitch(t,function(){
						t.resize();
					})
				);
			},
			
			homeButtonClick: function(t){
				t.obj.graphOpen = '';
				t.map.setMapCursor('default');
				// remove graphics when clearing
				t.map.graphics.clear();
				t.huc8.clear();
				t.soils.clear();
				t.huc12.clear();
				t.streams.clear();
				$('#' + t.id + 'cb-none, #' + t.id + 'graphHide').trigger("click");
				$('#' + t.id + 'graphShow').hide();
				$('#' + t.id + 'ch-traitsDiv, #' + t.id + 'ch-yearsDiv').slideUp();
				//t.map.setExtent(t.dynamicLayer.initialExtent, true);
				t.map.setExtent(t.extent, true);
				// just keep the Huc 8 displayed
				t.obj.sel = "";
				$('#' + t.id + 'ch-HUC8').val('').trigger('chosen:updated').trigger('change');
				$('#' + t.id + 'topWrapper, #' + t.id + 'supData, #' + t.id + 'temporalWrapper, #' + t.id + 'hucWrapper').slideUp();
				$('#' + t.id + 'bottomDiv').hide();
				$('#' + t.id + 'home').slideDown();
				$('#' + t.id + 'sampleValue').hide();
				t.obj.traitSelected = '';
				t.map.removeLayer(t.land);
				t.map.removeLayer(t.soils);
				t.map.removeLayer(t.samplingStations);
				t.map.removeLayer(t.huc8);
				t.map.removeLayer(t.huc8_click);
				t.map.removeLayer(t.impWater);
				t.map.removeLayer(t.sampPoint);
				t.obj.visibleLayers = []
				t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				$(t.con).animate({ height: '250px', width: '350px' }, 250,
					lang.hitch(t,function(){
						t.resize();
					})
				);
			},
			impClear: function(t){
				t.map.graphics.clear();
				t.map.setExtent(t.dynamicLayer.initialExtent, true);
				$('#' + t.id + 'chartHeader').text("Please choose or click on a HUC8");
				$('#' + t.id + 'hucWrapper, #' + t.id + 'clearWrapper').slideUp();
				$('#' + t.id + 'bottomDiv').hide();
				$('#' + t.id + 'home').slideDown();
				$('#' + t.id + 'waterAttributes').hide();
				$('#' + t.id + 'impTableWrapper, #' + t.id + 'impStartText, #' + t.id + 'noImpText').hide();
				t.map.removeLayer(t.impWater);
				t.obj.visibleLayers = [];
				t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				$(t.con).animate({ height: '250px', width: '350px' }, 250,
					lang.hitch(t,function(){
						t.resize();
					})
				);
			}
			
        });
    }
);