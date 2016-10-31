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
			huc8Select: function(c, p, t){
				// clear traits value if huc 8 dropdown menu was cleared
				p = $('#' + t.id + 'ch-HUC8').val()
				t.obj.huc8Selected[0] = '';
				//t.obj.traitArray = [];
				$('#' + t.id + 'ch-traits').val('').trigger('chosen:updated').trigger('change');
				if(t.obj.stateSet == 'no'){
					$('#' + t.id + 'cb-none').trigger("click");
					t.obj.traitSelected = '';
				}

				$('#' + t.id + 'ch-traits').empty();
				// if something was selected in the huc 8 dropdown
				if(p || t.obj.stateSet == 'yes'){
					if (t.streamsChecked == 'yes'){

						t.map.removeLayer(t.streams);
					}
					t.obj.spatialLayerArray = [2];
					t.obj.visibleLayers = [2];
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
					t.map.removeLayer(t.samplePoints);
					$('#' + t.id + 'ch-points').prop( "checked", false ).trigger('change');

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
						t.obj.visibleLayers = [0,2];
						t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
						t.map.addLayer(t.samplingStations);
					}
// check to see if the watershed contains a raster layer. if it does not dont display trait dropdown
// and alert user that there is none.
					t.containsNumber = 'no'
					// $.each(t.layersArray, lang.hitch(t,function(i,v){
						// if(v.name.includes(t.obj.huc8Selected[0])== true){
							// var matches = v.name.match(/\d+/g);
							// if (matches != null) {
								// t.containsNumber = 'yes'
							// }else{
								// t.containsNumber = 'no'
							// }
						// }
					// }));
					// console.log(t.containsNumber, 'num')
					// if(t.containsNumber == 'yes'){
						// $('#' + t.id + 'noDataText').hide();
					// }else{
						// if(t.obj.sel == 'sp'){
							// $('#' + t.id + 'noDataText').show();
							// $('#' + t.id + 'ch-traitsDiv').hide();
						// }else{
							// $('#' + t.id + 'noDataText').hide();
						// }
					// }
					
// determine what we need to show in the supdata section based on if the alyers exist. 
					
					var list = []
					$.each(t.layersArray, lang.hitch(t,function(i,v){
						console.log(v.name.search(t.obj.huc8Selected[0]));
						if(v.name.search(t.obj.huc8Selected[0]) > -1){
							console.log(v.name)
							list.push(v.name);
						}
						// if(v.name.includes(t.obj.huc8Selected[0])== true){
							////check to see if banks are in the sup data 
							// list.push(v.name);
						// }
					}));
					console.log(list)
					// test banks
					t.bankHide = '';
					$.each(list, lang.hitch(t,function(i,v){
						if(v.search('Banks') > -1){
							t.bankHide = 'no';
						}
					}));
					if(t.bankHide != 'no'){
						$('#' + t.id + 'bankParent').hide();
					}else{
						$('#' + t.id + 'bankParent').show();
					}
					// test streams
					t.streamHide = '';
					$.each(list, lang.hitch(t,function(i,v){
						if(v.search('Streams') > -1){
							t.streamHide = 'no';
						}
					}));
					if(t.streamHide != 'no'){
						$('#' + t.id + 'streamParent').hide();
					}else{
						$('#' + t.id + 'streamParent').show();
					}
					// test soils
					t.soilsHide = '';
					$.each(list, lang.hitch(t,function(i,v){
						if(v.search('Soils') > -1){
							t.soilsHide = 'no';
						}
					}));
					if(t.soilsHide != 'no'){
						$('#' + t.id + 'soilsParent').hide();
					}else{
						$('#' + t.id + 'soilsParent').show();
					}
					// test lands
					t.landHide = '';
					$.each(list, lang.hitch(t,function(i,v){
						if(v.search('NLCD') > -1){
							t.landHide = 'no';
						}
					}));
					if(t.landHide != 'no'){
						$('#' + t.id + 'landParent').hide();
					}else{
						$('#' + t.id + 'landParent').show();
					}
					
					// query for huc 8 select
					t.selectHuc8 = new Query();
					t.selectHuc8.where = "HUC_8 = '" + t.obj.huc8Selected[1] + "'";
					t.huc8.selectFeatures(t.selectHuc8, FeatureLayer.SELECTION_NEW);

				} else{
					$('#' + t.id + 'noDataText').hide();
					t.map.removeLayer(t.land);
					t.map.removeLayer(t.soils);
					t.map.removeLayer(t.samplingStations);
					t.map.removeLayer(t.huc8);
					t.map.removeLayer(t.streams);
					t.map.removeLayer(t.huc8_click);
					t.map.removeLayer(t.impWater);
					t.map.removeLayer(t.samplePoints);
					if(t.bankChecked == 'yes'){
						t.map.removeLayer(t.bank);
					}
					if (t.streamsChecked == 'yes'){
						t.map.removeLayer(t.streams);
					}
					$('#' + t.id + 'sampleValue').hide();
					t.obj.visibleLayers = [2]
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
					t.map.setExtent(t.dynamicLayer.initialExtent, true);
					$('#' + t.id + 'supData').slideUp();
					var ch = $('#' + t.id + 'spatialWrapper').find('.ch-divs');
					$.each(ch, lang.hitch(t, function(i, v){
						$('#' + v.id).hide();
					}));
				}
			},
			traitsSelect: function(c,d,t){
				var traitTest = $('#' + t.id + 'ch-traits').val();
				$('#' + t.id + 'ch-years').empty();
				// clear years value if traits dropdown menu was cleared
				$('#' + t.id + 'ch-years').val('').trigger('chosen:updated').trigger('change');
				// something was selected from traits dropdown.
				if(d || t.stateTraits == 'yes'){
					// append empty option as first value
					$('#' + t.id + 'ch-years').append('<option value=""></option>');
					t.obj.traitSelected = t.obj.huc8Selected[0] + " - " + traitTest + " -";
					t.obj.trait = c.currentTarget.value;
					// loop through layers array
					$.each(t.layersArray, lang.hitch(t,function(i,v){
						var wn = v.name
						var n = wn.substring(0, wn.length - 5)
						if (n == t.obj.traitSelected){
							var y = wn.slice(-4)
							$('#' + t.id + 'ch-years').append('<option value="' + Number(v.id) + '">' + y + '</option>');
						}
					}));
					$('#' + t.id + 'ch-years').trigger("chosen:updated");
					$('#' + t.id + 'ch-yearsDiv').slideDown();
				} else{
					$('#' + t.id + 'ch-years').val('').trigger("chosen:updated");
					$('#' + t.id + 'ch-yearsDiv').slideUp();
					$('#' + t.id + 'sampleValue').hide();
				};
			},
			yearsSelect: function(c,v,t){
				if(v || t.stateYear == 'yes'){
					// remove a raster layer if it already exists in the layers array. this keeps the rasters from stacking on each other
					var index = t.obj.spatialLayerArray.indexOf(Number(t.obj.yearSelected));
					if(index > -1){
						t.obj.spatialLayerArray.splice(index,1);
					}
					var index = t.obj.visibleLayers.indexOf(Number(t.obj.yearSelected));
					if(index > -1){
						t.obj.visibleLayers.splice(index,1);
					}
					$('#' + t.id + 'ch-pointsDiv').slideDown();
					t.obj.yearSelected = $('#' + t.id + 'ch-years').val();
					t.obj.spatialLayerArray.push(Number(t.obj.yearSelected));
					t.obj.visibleLayers.push(Number(t.obj.yearSelected));
					t.dynamicLayer.setVisibleLayers(unique(t.obj.visibleLayers));
					var lyrName = '';
					$.each(t.layersArray, lang.hitch(t,function(i,v){
						if(v.id == t.obj.yearSelected){
							lyrName = v.name;
							return false;
						}
					}));
					t.samplePoints.setDefinitionExpression("raster = '" + lyrName + "'");
				} else{
					var index = t.obj.spatialLayerArray.indexOf(Number(t.obj.yearSelected));
					if(index > -1){
						t.obj.spatialLayerArray.splice(index,1);
					}
					var index = t.obj.visibleLayers.indexOf(Number(t.obj.yearSelected));
					if(index > -1){
						t.obj.visibleLayers.splice(index,1);
					}
					//$('#' + t.id + 'ch-years').empty();
					$('#' + t.id + 'ch-years').val('').trigger('chosen:updated');
					$('#' + t.id + 'ch-pointsDiv').hide();
					$('#' + t.id + 'sampleValue').hide();
					//t.obj.yearSelected = undefined;
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
					$('#' + t.id + 'ch-points').prop( "checked", false ).trigger('change');

				}
			},
			samplePointClick: function(v,t){
				var lyrName = '';
				if(v.currentTarget.checked == true){
					t.obj.samplePointChecked = 'yes';
					t.map.addLayer(t.samplePoints);
				}else{
					$('#' + t.id + 'sampleValue').hide();
					t.map.removeLayer(t.samplePoints);
				}
			},


			traitPopulate: function(t){
				t.obj.traitArray = [];
				// something was selected
				$.each(t.layersArray, lang.hitch(t,function(i,v){
					var splitStr = v.name.split(" - ");
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
					if (v == "Turbitity"){
						traitText = "Turbitity (NTU)";
					}
					if (v == "Total Suspended Solids"){
						traitText = "Total Suspended Solids (mg/L)";
					}
					if (v == "Total Dissolved Solids"){
						traitText = "Total Dissolved Solids (mg/L)";
					}
					if (v == "Dissolved Oxygen"){
						traitText = "Dissolved Oxygen (mg/L)";
					}
					if (v == "Phosphorus"){
						traitText = "Phosphorus (mg/L)";
					}
					if (v == "Nitrogen"){
						traitText = "Nitrogen (mg/L)";
					}
					if(v == "Phosphate"){
						traitText = "Phosphate (mg/L)";
					}
					if(v == "Nitrate"){
						traitText = "Nitrate (mg/L)";
					}
					if(v == "Ammonia"){
						traitText = "Ammonia (mg/L)";
					}
					if(v == "Inorganic Nitrogen"){
						traitText = "Inorganic Nitrogen (mg/L)";
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