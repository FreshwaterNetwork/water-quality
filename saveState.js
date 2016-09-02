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
            doTest: function(t) {
            },
			saveStateFunc: function(t){
				//start of handleState.js
				if(t.obj.sel == 'sp'){
					$('#' + t.id + 'spatial').trigger('click');
					if(t.obj.huc8Sel != ''){
						var p = 'r'
						var d = t.obj.traitSelected;
						$('#' + t.id + 'ch-HUC8').val(t.obj.huc8Sel).trigger('chosen:updated').trigger('change', p);
						if(t.obj.traitSelected != ''){
							t.stateTraits = 'yes';
							$('#' + t.id + 'ch-traits').val(t.obj.trait).trigger('chosen:updated').trigger('change', d);
							t.stateTraits = 'no';
							if(t.obj.yearSelected != ''){
								t.stateYear = 'yes';
								$('#' + t.id + 'ch-years').val(t.obj.yearSelected).trigger('chosen:updated').trigger('change', p);
								t.stateYear = 'no';
								if(t.obj.samplePointChecked == 'yes'){
									$('#' + t.id + 'ch-points').trigger('click');
								}
							}
						}
						
						// work with sup layers in both tm and sp 
						if(t.obj.supLayer != 'none'){
							$('#' + t.id + t.obj.supLayer).trigger('click');
							if(t.obj.huc12ID != ''){
								var pnt = t.obj.huc12ID;
								t.h12Query = new esri.tasks.Query();
								t.h12Query.where = "HUC_12 = " + "'" + pnt + "'";
								t.huc12.selectFeatures(t.h12Query,esri.layers.FeatureLayer.SELECTION_NEW);
								//t.obj.huc12ID = '';
							}
							if(t.obj.soilStateID != ''){
								var pnt = t.obj.soilStateID;
								t.sQuery = new esri.tasks.Query();
								t.sQuery.where = "OBJECTID = " +  pnt;
								var soilsUrl = t.obj.url + "/" + t.obj.soilID;
								t.soils = new FeatureLayer(soilsUrl, { mode: esri.layers.FeatureLayer.MODE_SELECTION, outFields: "*"});
								t.soils.setSelectionSymbol(t.soilsSym);
								t.map.addLayer(t.soils);
								t.soils.selectFeatures(t.sQuery,esri.layers.FeatureLayer.SELECTION_NEW);
								t.soils.on("selection-complete", lang.hitch(t,function(f){
									if (f.features.length > 0){
										$('#' + t.id + 'clickSoils').show();
										var c = "<div class='supDataText' style='padding:6px;'><b>Soil Type: </b>${Map_unit_n}</div>";
										var content = esriLang.substitute(f.features[0].attributes,c);
										$('#' + t.id + 'clickSoils').html(content);
									}
								}));
							//t.obj.soilStateID = '';
							}
						}
						
					}
				}
				// work with if tm section
				if(t.obj.sel == 'tm'){
					$('#' + t.id + 'temporal').trigger('click');
					if(t.obj.huc8Sel != ''){
						// work with sup layers in both tm and sp 
						if(t.obj.supLayer != 'none'){
							$('#' + t.id + t.obj.supLayer).trigger('click');
							if(t.obj.huc12ID != ''){
								var pnt = t.obj.huc12ID;
								t.h12Query = new esri.tasks.Query();
								t.h12Query.where = "HUC_12 = " + "'" + pnt + "'";
								t.huc12.selectFeatures(t.h12Query,esri.layers.FeatureLayer.SELECTION_NEW);
								//t.obj.huc12ID = '';
							}
							if(t.obj.soilStateID != ''){
								var pnt = t.obj.soilStateID;
								t.sQuery = new esri.tasks.Query();
								t.sQuery.where = "OBJECTID = " +  pnt;
								var soilsUrl = t.obj.url + "/" + t.obj.soilID;
								t.soils = new FeatureLayer(soilsUrl, { mode: esri.layers.FeatureLayer.MODE_SELECTION, outFields: "*"});
								t.soils.setSelectionSymbol(t.soilsSym);
								t.map.addLayer(t.soils);
								t.soils.selectFeatures(t.sQuery,esri.layers.FeatureLayer.SELECTION_NEW);
								t.soils.on("selection-complete", lang.hitch(t,function(f){
									if (f.features.length > 0){
										$('#' + t.id + 'clickSoils').show();
										var c = "<div class='supDataText' style='padding:6px;'><b>Soil Type: </b>${Map_unit_n}</div>";
										var content = esriLang.substitute(f.features[0].attributes,c);
										$('#' + t.id + 'clickSoils').html(content);
									}
								}));
							//t.obj.soilStateID = '';
							}
						}
						var p = 'r'
						var d = t.obj.traitSelected;
						$('#' + t.id + 'ch-HUC8').val(t.obj.huc8Sel).trigger('chosen:updated').trigger('change', p);
						if(t.obj.graphOpen == 'yes'){
							var pntOID = t.obj.ssOID;
							t.hQuery = new esri.tasks.Query();
							t.hQuery.where = "OBJECTID = " + pntOID;
							t.samplingStations.selectFeatures(t.hQuery,esri.layers.FeatureLayer.SELECTION_NEW);
						}
					}
				}
				if(t.obj.sel == 'imp'){
					$('#' + t.id + 'impWaterButton').trigger('click');
					if(t.obj.impStateID != ''){
						var impID = t.obj.impStateID;
						t.impQuery = new esri.tasks.Query();
						t.impQuery.where = "SUBSEGMENT = " + "'" + impID + "'";
						t.impWater.selectFeatures(t.impQuery, esri.layers.FeatureLayer.SELECTION_NEW);
					}
				}
				t.map.setExtent(t.obj.extent, true);
				t.obj.stateSet = 'no'
			}
		});
    }
);