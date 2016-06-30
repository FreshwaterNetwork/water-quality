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
                console.log('graph clicks');
            },
			huc8Select: function(c, p, t){
				console.log('t huc 8 dropdown');
				// clear traits value if huc 8 dropdown menu was cleared
				p = $('#' + t.id + 'ch-HUC8').val()
				t.obj.traitSelected = undefined;
				t.obj.huc8Selected[0] = '';
				//t.obj.traitArray = [];
				$('#' + t.id + 'ch-traits').val('').trigger('chosen:updated').trigger('change');
				$('#' + t.id + 'cb-none').trigger("click");
				$('#' + t.id + 'ch-traits').empty();
				// if something was selected in the huc 8 dropdown
				if(p){
					t.obj.spatialLayerArray = [2];
					t.obj.visibleLayers = [2];
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
					$('#' + t.id + 'ch-traits').val('').trigger('chosen:updated');
					var val = $('#' + t.id + 'ch-HUC8').val();
					$('#' + t.id + 'ch-traitsDiv').show();
					t.obj.huc8Selected = c.currentTarget.value.split("_");
					if(t.obj.huc8Sel == c.currentTarget.value){
						t.obj.inHuc8 = 'yes';
					}else{
						t.obj.inHuc8 = 'no';
					}
					t.obj.huc8Sel = c.currentTarget.value;
					// if we are in the spatial side
					if(t.obj.sel == "sp"){
						t.dropdown.traitPopulate(t);
						$('#' + t.id + 'supData, #' + t.id + 'spatialWrapper').slideDown();
						$('#' + t.id + 'ch-traitsDiv').slideDown();
						$('#' + t.id + 'graphHide, #' + t.id + 'graphShow').hide();
					};
					// if we are in the temporal side
					if(t.obj.sel == "tm"){
						t.dropdown.traitPopulate(t);
						$('#' + t.id + "supData").slideDown();
						t.obj.visibleLayers = [2];
						t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
						t.map.addLayer(t.samplingStations);
					}
					t.selectHuc8 = new Query();
					t.selectHuc8.where = "HUC_8 = '" + t.obj.huc8Selected[1] + "'";
					t.huc8.selectFeatures(t.selectHuc8, FeatureLayer.SELECTION_NEW);
				} else{
					t.map.setExtent(t.dynamicLayer.initialExtent, true);
					$('#' + t.id + 'supData').slideUp();
					var ch = $('#' + t.id + 'spatialWrapper').find('.ch-divs');
					$.each(ch, lang.hitch(t, function(i, v){
						$('#' + v.id).hide();
					}));
				}
			},
			traitsSelect: function(c,d,t){
				console.log(c, d, t, 'look here');
				console.log('traits select');
				// clear years value if traits dropdown menu was cleared
				$('#' + t.id + 'ch-years').val('').trigger('chosen:updated').trigger('change');
				// something was selected from traits dropdown.
				if(d) {
					console.log('trait selected');
					// append empty option as first value
					$('#' + t.id + 'ch-years').append('<option value=""></option>');
					t.obj.traitSelected = t.obj.huc8Selected[0] + "_" + d.selected;
					// loop through layers array
					$.each(t.layersArray, lang.hitch(t,function(i,v){
						var wn = v.name
						var n = wn.substring(0, wn.length - 5)
						if (n == t.obj.traitSelected){
							var y = wn.slice(-4)
							$('#' + t.id + 'ch-years').append('<option value="' + v.id + '">' + y + '</option>');
						}
					}));
					$('#' + t.id + 'ch-years').trigger("chosen:updated");
					$('#' + t.id + 'ch-yearsDiv').slideDown();
				} else{
					console.log('no trait selected');
					$('#' + t.id + 'ch-years').val('').trigger("chosen:updated");
					$('#' + t.id + 'ch-yearsDiv').slideUp();
				};
			},
			yearsSelect: function(c,v,t){
				console.log('years select');
				if(v){
					$('#' + t.id + 'ch-pointsDiv').slideDown();
					t.obj.yearSelected = v.selected;
					t.obj.spatialLayerArray.push(t.obj.yearSelected);
					t.obj.visibleLayers.push(t.obj.yearSelected);
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
					console.log('years click')
					var lyrName = '';
					$.each(t.layersArray, lang.hitch(t,function(i,v){
						if(v.id == t.obj.yearSelected){
							lyrName = v.name;
							return false;
						}
					}));
					t.samplePoints.setDefinitionExpression("raster = '" + lyrName + "'");
				} else{
					$('#' + t.id + 'ch-years').empty();
					$('#' + t.id + 'ch-pointsDiv').hide();
					var index = t.obj.spatialLayerArray.indexOf(t.obj.yearSelected);
					if(index > -1){
						t.obj.spatialLayerArray.splice(index,1);
					}
					var index = t.obj.visibleLayers.indexOf(t.obj.yearSelected);
					if(index > -1){
						t.obj.visibleLayers.splice(index,1);
					}
					t.obj.yearSelected = undefined;
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
					$('#' + t.id + 'ch-points').prop( "checked", false ).trigger('change');

				}
			},
			samplePointClick: function(v,t){
				var lyrName = '';
				if(v.currentTarget.checked == true){
					t.map.addLayer(t.samplePoints);
				}else{
					t.map.removeLayer(t.samplePoints);
				}
			},
			traitPopulate: function(t){
				console.log('trait populate');
				t.obj.traitArray = [];
				// something was selected
				$.each(t.layersArray, lang.hitch(t,function(i,v){
					var splitStr = v.name.split("_");
					if (t.obj.huc8Selected[0] == splitStr[0]){
						t.obj.traitArray.push(splitStr[1]);
					}
				}));
				//clear the text varmap
				t.obj.traitArray = unique(t.obj.traitArray);
				//append intital empty option
				$('#' + t.id + 'ch-traits').append('<option value=""></option>');
				//use lang.hitch so the 't' object is available for the append
				$.each(t.obj.traitArray, lang.hitch(t, function(i,v){
					var traitText = '';
					if (v == "TUR"){
						traitText = "Turbitity";
					}
					if (v == "TSS"){
						traitText = "Total Suspended Solids";
					}
					if (v == "TDS"){
						traitText = "Total Dissolved Solids";
					}
					if (v == "P"){
						traitText = "Phosphorus";
					}
					if (v == "N"){
						traitText = "Nitrogen";
					}
					if(v == "Phos"){
						traitText = "Phosphate";
					}
					if(v == "NNN"){
						traitText = "Nitrate";
					}
					if(v == "AMM"){
						traitText = "Ammonia";
					}
					if(v == "ION"){
						traitText = "Inorganic Nitrogen";
					}
					if (traitText != ''){
						//you have to use t.id to get the element (won't work without lang.hitch above
						$('#' + t.id + 'ch-traits').append('<option value="' + v + '">' + traitText + '</option>');
					}
				}));
				//after the loop trigger an update to the select menu
				$('#' + t.id + 'ch-traits').trigger("chosen:updated");
			}
			
        });
    }
);