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
				t.obj.year = '';
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
					t.map.addLayer(t.huc8)
					t.map.addLayer(t.huc8_click)
					$.each(t.huc8s, lang.hitch(t, function(i,v){
						if(p == v.Abbr){
							t.huc8CleanName = v.clean_names
						}
					}));
					// build the trait dropdown
					$.each(c.currentTarget, lang.hitch(this, function(i,v){
						if(v.selected === true){
							t.hucClean = $(v).html();
						}
					}));
					t.huc8Choosen = c.currentTarget.value;
					
					if (t.streamsChecked == 'yes'){
						t.map.removeLayer(t.streams);
					}
					// set and update vis layers
					t.obj.spatialLayerArray = [0];
					t.obj.visibleLayers = [0];
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
					
					// remove and uncheck sample points checkbox
					//t.map.removeLayer(t.sampPoints);
					
					$('#' + t.id + 'ch-points').prop( "checked", false ).trigger('change');
					// trigger traits menu to empy val
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
					
					// query for huc 8 select
					t.selectHuc8 = new Query();
					t.huc8Abbr = c.currentTarget.value;
					t.selectHuc8.where = "Abbr = '" + t.huc8Abbr + "'";
					t.huc8.selectFeatures(t.selectHuc8, FeatureLayer.SELECTION_NEW);

				} else{
					t.huc8.clear();
					//$('#' + t.id + 'noDataText').hide();
					t.map.removeLayer(t.land);
					t.map.removeLayer(t.soils);
					t.map.removeLayer(t.samplingStations);
					t.map.removeLayer(t.streams);
					t.map.removeLayer(t.huc8_click);
					t.map.removeLayer(t.huc8);
					t.map.removeLayer(t.impWater);
					t.map.removeLayer(t.sampPoint);
					if(t.bankChecked == 'yes'){
						t.map.removeLayer(t.bank);
					}
					if (t.streamsChecked == 'yes'){
						t.map.removeLayer(t.streams);
					}
					$('#' + t.id + 'sampleValue').hide();
					t.obj.visibleLayers = [0]
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
					t.map.setExtent(t.extent, true);
					$('#' + t.id + 'supData').slideUp();
					var ch = $('#' + t.id + 'spatialWrapper').find('.ch-divs');
					$.each(ch, lang.hitch(t, function(i, v){
						$('#' + v.id).hide();
					}));
				}
				// dropdown trait menu but change the value to say there is not traits.
				if($('#' + t.id + 'ch-traits' + '> option').length == 1){
					$('#' + t.id + 'ch-traits').append("<option value='Nada' selected>No Traits for this Watershed</option>")
					$('#' + t.id + 'ch-traits').trigger("chosen:updated");
				}
			},
			traitsSelect: function(c,d,t){
				var traitVal = $('#' + t.id + 'ch-traits').val();
				$('#' + t.id + 'ch-years').empty();
				// clear years value if traits dropdown menu was cleared
				$('#' + t.id + 'ch-years').val('').trigger('chosen:updated').trigger('change');
				// something was selected from traits dropdown.
				if(d || t.stateTraits == 'yes'){
					// append empty option as first value
					$('#' + t.id + 'ch-years').append('<option value=""></option>');
					//t.obj.traitSelected = t.obj.huc8Selected[0] + " - " + traitTest + " -";
					/* t.obj.traitSelected = traitVal + " - " + t.obj.huc8Selected[0]; */
					t.obj.trait = c.currentTarget.value;
					$.each(c.currentTarget, lang.hitch(t, function(i,v){
						if (v.selected === true){
							t.traitClean = $(v).html();	
						}	
					}));
					// loop through layers array
					$.each(t.layersArray, lang.hitch(t,function(i,v){
						if(v.name == t.traitClean + " - " + t.hucClean){
							t.lyrID = v.id;
						}
					}));
					// build the years dropdown
					$.each(t.huc8s, lang.hitch(t,function(i,v){
						if(t.huc8Choosen == v.Abbr){
							var years = JSON.parse(v[t.obj.trait]).sort()
							$.each(years, lang.hitch(t,function(i,y){
								$('#' + t.id + 'ch-years').append(("<option value='" + y + "'>" + y + "</option>"))
							}));
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
					// selected year
					t.obj.year = c.currentTarget.value;
					$.each($('#' + t.id + 'supDataDiv input'), lang.hitch(this,function(i,v){
						if(v.checked == true){
							var c = v;
							$('#' + t.id + c.value).trigger("click");
						}
					}));
					// sample points div slide down
					$('#' + t.id + 'ch-pointsDiv').slideDown();
					$('#' + t.id + 'ch-points').prop( "checked", false ).trigger('change');
					
				} else{
					t.obj.year = '';
					$('#' + t.id + 'ch-years').val('').trigger('chosen:updated');
					$('#' + t.id + 'ch-pointsDiv').hide();
					$('#' + t.id + 'sampleValue').hide();
					var index = $.inArray(t.lyrID, t.obj.visibleLayers);
					if(index > -1){
						t.obj.visibleLayers.splice(index,1);
					}
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
					
					$('#' + t.id + 'ch-points').prop( "checked", false ).trigger('change');
				}
			},

			traitPopulate: function(t){
				$('#' + t.id + 'ch-traits').empty();
				$('#' + t.id + 'ch-traits').append("<option value=''></option>")
				// Determine which traits exist for selected HUC8
				$.each(t.huc8s,function(i,v){
					if (t.huc8Choosen == v.Abbr){
						if (v.Ammonia){
							$('#' + t.id + 'ch-traits').append("<option value='Ammonia'>Ammonia</option>")
						}
						if (v.DissolvedOxygen){
							$('#' + t.id + 'ch-traits').append("<option value='DissolvedOxygen'>Dissolved Oxygen</option>")
						}
						if (v.InorganicNitrogen){
							$('#' + t.id + 'ch-traits').append("<option value='InorganicNitrogen'>Inorganic Nitrogen</option>")
						}
						if (v.Nitrate){
							$('#' + t.id + 'ch-traits').append("<option value='Nitrate'>Nitrate</option>")
						}
						if (v.Phosphorus){
							$('#' + t.id + 'ch-traits').append("<option value='Phosphorus'>Phosphorus</option>")
						}
						if (v.TotalDissolvedSolids){
							$('#' + t.id + 'ch-traits').append("<option value='TotalDissolvedSolids'>Total Dissolved Solids</option>")
						}
						if (v.TotalNitrogen){
							$('#' + t.id + 'ch-traits').append("<option value='TotalNitrogen'>Total Nitrogen</option>")
						}
						if (v.TotalSuspendedSolids){
							$('#' + t.id + 'ch-traits').append("<option value='TotalSuspendedSolids'>Total Suspended Solids</option>")
						}
						if (v.Turbidity){
							$('#' + t.id + 'ch-traits').append("<option value='Turbidity'>Turbidity</option>")
						}
						$('#' + t.id + 'ch-traits').trigger("chosen:updated");
					}
				})
			}

        });
    }
);