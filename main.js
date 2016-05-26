// Pull in your favorite version of jquery
require({
	packages: [{ name: "jquery", location: "http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/", main: "jquery.min" }]
});
// Bring in dojo and javascript api classes as well as varObject.json and content.html
define([
	"esri/layers/ArcGISDynamicMapServiceLayer", "esri/geometry/Extent", "esri/SpatialReference", "esri/tasks/query", "esri/tasks/QueryTask",
	"esri/symbols/PictureMarkerSymbol", "dijit/TooltipDialog", "dijit/popup",
	"dojo/_base/declare", "framework/PluginBase", "esri/layers/FeatureLayer", "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol", "esri/lang", "esri/tasks/Geoprocessor",
	"esri/symbols/SimpleMarkerSymbol", "esri/graphic", "dojo/_base/Color", 	"dijit/layout/ContentPane", "dijit/form/HorizontalSlider", "dojo/dom",
	"dojo/dom-class", "dojo/dom-style", "dojo/dom-construct", "dojo/dom-geometry", "dojo/_base/lang", "dojo/on", "dojo/parser", 'plugins/water-quality/js/ConstrainedMoveable',
	"dojo/text!./varObject.json", "jquery", "dojo/text!./html/legend.html", "dojo/text!./html/content.html", 'plugins/water-quality/js/jquery-ui-1.11.2/jquery-ui', "esri/renderers/SimpleRenderer",
	"plugins/water-quality/chartist/chartist"
],
function ( ArcGISDynamicMapServiceLayer, Extent, SpatialReference, Query, QueryTask, PictureMarkerSymbol, TooltipDialog, dijitPopup,
	declare, PluginBase, FeatureLayer, SimpleLineSymbol, SimpleFillSymbol, esriLang, Geoprocessor, SimpleMarkerSymbol, Graphic, Color,
	ContentPane, HorizontalSlider, dom, domClass, domStyle, domConstruct, domGeom, lang, on, parser, ConstrainedMoveable, config, $, legendContent, content, ui, SimpleRenderer, Chartist ) {
		return declare(PluginBase, {
			// The height and width are set here when an infographic is defined. When the user click Continue it rebuilds the app window with whatever you put in.
			toolbarName: "Water Quality", showServiceLayersInLegend: true, allowIdentifyWhenActive: false, rendered: false, resizable: false,
			hasCustomPrint: true, usePrintPreviewMap: true, previewMapSize: [1000, 550], height:"200", width:"350",
			// Comment out the infoGraphic property below to make that annoying popup go away when you start the app
			//infoGraphic: "plugins/water-quality/images/infoGraphic.jpg",
			// First function called when the user clicks the pluging icon.
			// test comment
			initialize: function (frameworkParameters) {
				// Access framework parameters
				declare.safeMixin(this, frameworkParameters);
				// Set initial app size based on split screen state
				this.con = dom.byId('plugins/water-quality-0');
				this.con1 = dom.byId('plugins/water-quality-1');
				if (this.con1 != undefined){
					domStyle.set(this.con1, "width", "350px");
					domStyle.set(this.con1, "height", "200px");
				}else{
					domStyle.set(this.con, "width", "350px");
					domStyle.set(this.con, "height", "200px");
				}
				// Define object to access global variables from JSON object. Only add variables to varObject.json that are needed by Save and Share.
				this.obj = dojo.eval("[" + config + "]")[0];
			},
			// Called after initialize at plugin startup (why all the tests for undefined). Also called after deactivate when user closes app by clicking X.
			hibernate: function () {
				//$('.legend').removeClass("hideLegend");
				this.map.__proto__._params.maxZoom = 23;
				if (this.appDiv != undefined){
					$('#' + this.id + 'ch-HUC8').val('').trigger('chosen:updated');
					$('#' + this.id + 'ch-HUC8').trigger('change');
				}
			},
			// Called after hibernate at app startup. Calls the render function which builds the plugins elements and functions.
			activate: function () {
				// Hide framework default legend
				//$('.legend').addClass("hideLegend");
				//this.map.__proto__._params.maxZoom = 19;
				if (this.rendered == false) {
					this.rendered = true;
					this.render();
					// Hide the print button until a hex has been selected
					$(this.printButton).hide();
					this.dynamicLayer.setVisibility(true);
				} else {
					if (this.dynamicLayer != undefined)  {
						this.dynamicLayer.setVisibility(true);
						if ( this.map.getZoom() > 12 ){
							this.map.setLevel(12)
						}
					}
				}
			},
			// Called when user hits the minimize '_' icon on the pluging. Also called before hibernate when users closes app by clicking 'X'.
			deactivate: function () {
				//$('.legend').removeClass("hideLegend");
			},
			// Called when user hits 'Save and Share' button. This creates the url that builds the app at a given state using JSON.
			// Write anything to you varObject.json file you have tracked during user activity.
			getState: function () {
				this.obj.extent = this.map.geographicExtent;
				this.obj.stateSet = "yes";
				// Get OBJECTIDs of filtered items
				if ( this.itemsFiltered.length > 0 ){
					$.each(this.itemsFiltered, lang.hitch(this,function(i,v){
						this.obj.filteredIDs.push(v.OBJECTID)
					}));
				}
				var state = new Object();
				state = this.obj;
				return state;
			},
			// Called before activate only when plugin is started from a getState url.
			//It's overwrites the default JSON definfed in initialize with the saved stae JSON.
			setState: function (state) {
				this.obj = state;
			},
			// Called when the user hits the print icon
			beforePrint: function(printDeferred, $printArea, mapObject) {
				// Add hexagons
				var layer = new ArcGISDynamicMapServiceLayer(this.obj.url, {opacity:0.5});
				layer.setVisibleLayers([7,10,11])
				this.obj.layerDefs[10] = this.obj.crsDef
				this.obj.layerDefs[11] = this.obj.crsDef
				layer.setLayerDefinitions(this.obj.layerDefs);
				mapObject.addLayer(layer);
				// Add map graphics
				mapObject.graphics.add(new Graphic(this.crsFL.graphics[0].geometry, this.crsFL.graphics[0].symbol ));
				$.each(this.parcelsFL.graphics, lang.hitch(this,function(i,v){
					mapObject.graphics.add(new Graphic(this.parcelsFL.graphics[i].geometry, this.parcelsFL.graphics[i].symbol ));
				}));
				// Add content to printed page
				$printArea.append("<div id='title'>" + this.obj.huc8Selected + "</div>")
				//$printArea.append("<div id='summary' class='printSummary'>" + $('#' + this.id + 'printSummary').html() + "</div>")
				$printArea.append("<div id='tableWrapper'><div id='tableTitle'>Selected Parcels</div><table id='table' class='printTable'>" + $('#' + this.id + 'myPrintTable').html() + "</table></div>");

                printDeferred.resolve();
            },
			// Resizes the plugin after a manual or programmatic plugin resize so the button pane on the bottom stays on the bottom.
			// Tweak the numbers subtracted in the if and else statements to alter the size if it's not looking good.
			resize: function(w, h) {
				cdg = domGeom.position(this.container);
				if (cdg.h == 0) { this.sph = this.height - 10; }
				else { this.sph = cdg.h - 10; }
				domStyle.set(this.appDiv.domNode, "height", this.sph + "px");
			},
			// Called by activate and builds the plugins elements and functions
			render: function() {
				// Define Content Pane
				this.appDiv = new ContentPane({style:'padding:8px 8px 8px 8px'});
				this.id = this.appDiv.id;
				parser.parse();
				dom.byId(this.container).appendChild(this.appDiv.domNode);
				// Get html from content.html, prepend appDiv.id to html element id's, and add to appDiv
				var idUpdate = content.replace(/id='/g, "id='" + this.id);
				$('#' + this.id).html(idUpdate);
				$('.buttonBar__button').tooltip()
				// set up accordian
				$('#' + this.id + 'dlAccord').accordion({
					collapsible: true,
					active: 0,
					heightStyle: "content"
				});
				$('#' + this.id + 'grAccord').accordion({
					collapsible: true,
					active: false,
					heightStyle: "content"
				});

				// HUC12 Symbol
				this.hucSym = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
					new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
					new Color([200,132,29,0.7]), 1),
					new Color([125,125,125,0]));
				this.huc12Sym = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
					new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
					new Color([155,103,23]), 2),
					new Color([236,239,222,.25]));
				// soil symbol
				this.soilsSym = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
						new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
						new Color([100,100,0,1]), 2),
						new Color([100,100,0,0.3]));
				// sample points symbol
				this.pntSym = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 11,
						new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
						new Color([0,0,0]), 1.5),
						new Color([161,70,18,1]));
				// sample station markers
				this.hlStationPointS = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 11,
						new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
						new Color([0,0,255]), 2),
						new Color([206,200,58,0]));
				this.hlStationPointM = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 14,
						new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
						new Color([0,0,255]), 3),
						new Color([206,200,58,0]));
				this.hlStationPointL = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 16,
						new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
						new Color([0,0,255]), 3),
						new Color([206,200,58,0]));
				this.hlStationPointXL = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 20,
						new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
						new Color([0,0,255]), 3),
						new Color([206,200,58,0]));
				var huc8highlightSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
						new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
						new Color([13,172,252]), 2),
						new Color([236,239,222,0]));

				// HUC 8 zoom
				this.huc8 = new FeatureLayer(this.obj.url + "/2", { mode: esri.layers.FeatureLayer.MODE_SNAPSHOT, outFields: "*"});
				this.huc8.on("selection-complete", lang.hitch(this,function(f){
					var huc8Extent = f.features[0].geometry.getExtent().expand(1.5);
					this.map.setExtent(huc8Extent, true);
				}));
				// HUC 8 mouse over
				var map = this.map
				this.huc8.on("mouse-over", lang.hitch(this,function(evt){
					this.map.setMapCursor("pointer");
					var huc8highlightSymbol = new Graphic(evt.graphic.geometry,huc8highlightSymbol);
					map.graphics.add(huc8highlightSymbol);
				}));
				this.huc8.on("mouse-out", lang.hitch(this,function(evt){
					this.map.setMapCursor("default");
				}));
				// create the impaired watersheds layer.
				this.impWater = new FeatureLayer(this.obj.url + "/3", { mode: esri.layers.FeatureLayer.MODE_SNAPSHOT, outFields: "*"});
				// HUC12
				this.huc12 = new FeatureLayer(this.obj.url + "/1", { mode: esri.layers.FeatureLayer.MODE_SNAPSHOT, outFields: "*"});
				this.huc12.setRenderer(new SimpleRenderer(this.hucSym));
				this.map.infoWindow.resize(245,125);
				hucDialog = new TooltipDialog({
				  style: "position: absolute; max-width: 500px; font: normal normal normal 10pt Helvetica; z-index:100;"
				});
				// soils data
				this.soils = new FeatureLayer(this.obj.url + "/1000", { mode: esri.layers.FeatureLayer.MODE_SNAPSHOT, outFields: "*"});

				// land cover data
				this.land = new FeatureLayer(this.obj.url + "/1000", { mode: esri.layers.FeatureLayer.MODE_SNAPSHOT, outFields: "*"}); ;
				// sample points layer
				this.samplePoints = new FeatureLayer(this.obj.url + "/14", { mode: esri.layers.FeatureLayer.MODE_SNAPSHOT, outFields: "*"});
				this.samplePoints.setRenderer(new SimpleRenderer(this.pntSym));

				//sampling stations layer
				this.samplingStations = new FeatureLayer(this.obj.url + "/0", { mode: esri.layers.FeatureLayer.MODE_SNAPSHOT, outFields: "*"});
				this.samplingStations.on("mouse-over", lang.hitch(this,function(evt){
					this.map.setMapCursor("pointer");
				}));
				this.samplingStations.on("mouse-out", lang.hitch(this,function(evt){
					this.map.setMapCursor("default");
				}));
				this.samplingStations.on("click", lang.hitch(this,function(evt){
					var x = String(evt.target.attributes[10]);
					this.map.graphics.clear();
					this.obj.spAtts = evt.graphic.attributes;
					$('#' + this.id + 'chartHeader').text("Station ID " + this.obj.spAtts.generated_stations_old_ID);
					this.checkTraits(this.obj.spAtts);
					if(evt.target.attributes[10].nodeValue == "4"){
						var spHlGraphic = new Graphic(evt.graphic.geometry,this.hlStationPointS);
					}
					if(evt.target.attributes[10].nodeValue == "6"){
						var spHlGraphic = new Graphic(evt.graphic.geometry,this.hlStationPointM);
					}
					if(evt.target.attributes[10].nodeValue == "8"){
						var spHlGraphic = new Graphic(evt.graphic.geometry,this.hlStationPointL);
					}
					if(evt.target.attributes[10].nodeValue == "10"){
						var spHlGraphic = new Graphic(evt.graphic.geometry,this.hlStationPointXL);
					}
					this.map.graphics.add(spHlGraphic);
					$('#' + this.id + 'graphShow, #' + this.id + 'showGraphText, #' + this.id + 'supData, #' + this.id + 'huc8Wrapper, #'  + this.id + 'bottomDiv').hide();
					$('#' + this.id + 'graphDiv').slideDown('slow');
					$(this.con).animate({ height: '520px', width: '630px' }, 250,
						lang.hitch(this,function(){
							this.resize();
							$('#' + this.id + 'graphHide' ).show();
						})
					);

				}));
				// Declare all the dynamic map service layers
				//this.huc8Dynamic = new ArcGISDynamicMapServiceLayer(this.obj.url + '/2', {opacity: 1 - this.obj.sliderVal/10});
				// handle clicks on the graph show button
				$('#' + this.id + 'graphShow').on('click',lang.hitch(this,function(e){
					$('#' + this.id + 'graphDiv').show();
					$('#' + this.id + 'graphShow').hide();
					$('#' + this.id + 'ch-HUC8, #' + this.id + 'supData, #' + this.id + 'huc8Wrapper, #' + this.id + 'bottomDiv').hide();
					$('#' + this.id + 'chartHeader').text("Station ID: " + this.obj.spAtts.generated_stations_old_ID);
					$(this.con).animate({ height: '520px', width: '630px' }, 250,
						lang.hitch(this,function(){
							this.resize();
							$('#' + this.id + 'graphHide').show();
						})
					);
				}));
				// handle clicks on the graph hide button
				$('#' + this.id + 'graphHide').on('click',lang.hitch(this,function(e){
					$('#' + this.id + 'chartHeader').text("Please choose a HUC8");
					$('#' + this.id + 'graphDiv').hide();
					// write an if statement to see if anything has been selected.
					if (this.obj.huc8Selected[0] == undefined || this.obj.huc8Selected[0] == ''){
						console.log('there is no huc8 selected')
					} else{
						console.log('there is a huc 8 selected')
						$('#' + this.id + 'supData').slideDown();
					}
					$('#' + this.id + 'huc8Wrapper, #' + this.id + 'bottomDiv').show();
					$('#' + this.id + 'temporalWrapper').find('.graphToggle').toggle();
					$(this.con).animate({ height: '400px', width: '350px' }, 250,
						lang.hitch(this,function(){
							this.resize();
						})
					);
				}));
				//sampling station bar chart clicks
				$('#' + this.id + 'traitBar').on('click',lang.hitch(this,function(e){
					var btnch = $('#' + this.id + 'traitBar').find('.buttonBar__button');
					$.each(btnch, function(i,v){
						$('#' + v.id).removeClass('buttonBar__selected')
					})
					var temp = e.target.id
					$('#' + temp).addClass('buttonBar__selected');
					this.obj.tid = temp.split("-").pop();
					var val = this.obj.tid.slice(0,-4) + "value"
					this.obj.mean = JSON.parse(this.obj.spAtts[this.obj.tid])
					this.obj.val = JSON.parse(this.obj.spAtts[val])
					this.obj.a = this.massageArray()
					this.updateChart(this.obj.a)
				}));
				// handle clicks on text below bar graph bars
				$('.slText').click(lang.hitch(this,function(e){
					if ($(e.target).parent('.dis').length == 0){
						var c = $('#' + this.id + 'smLabelDiv').find('.slText')
						$.each(c, lang.hitch(this,function(i,v){
							$(v).parent('.smallLabels').removeClass('buttonBar__selected')
						}))
						$(e.target).parent('.smallLabels').addClass('buttonBar__selected')
						this.obj.year = $(e.target).html();
						this.updateLineChart()
						var c1 = $('#' + this.id + 'meanBarDiv').find('.meanBars')
						$.each(c1, lang.hitch(this,function(i, v) {
							if (v.id.substr(v.id.length - 4) == this.obj.year){
								$('#' + v.id).addClass('selBar')
							}else{
								$('#' + v.id).removeClass('selBar')
							}
						}));
					}
				}));
				// handle click on graph bars
				$('.meanBars').click(lang.hitch(this,function(e){
					if ($('#' + e.target.id).height() > 0){
						//add and remove classes
						var c = $('#' + this.id + 'meanBarDiv').find('.meanBars')
						$.each(c, function(i, v) {
							$('#' + v.id).removeClass('selBar')
						});
						$('#' + e.target.id).addClass('selBar');

						// get year
						var tid = e.target.id
						this.obj.year = tid.substr(tid.length - 4);
						this.updateLineChart()

						var c1 = $('#' + this.id + 'smLabelDiv').find('.slText')
						$.each(c1, lang.hitch(this,function(i,v){
							if ($(v).html() == this.obj.year){
								$(v).parent('.smallLabels').addClass('buttonBar__selected')
							}else{
								$(v).parent('.smallLabels').removeClass('buttonBar__selected')
							}
						}))
						}
					}));
				// on hover return value of graph bar for UX.
				$('.meanBars').mouseover(lang.hitch(this,function(e){
					var numVal = $('#' + e.target.id).height()/100 * this.obj.rangeNum;
					numVal = numVal.toFixed(2);
					e.currentTarget.title = 'Value: ' + numVal;

				}));
				// handle clicks on internal spatial button
				$('#' + this.id + 'spaBtn').on('click',lang.hitch(this,function(){
					this.obj.sel = 'sp';
					// logic to see if a trait has been chosen or not,
					if (this.obj.huc8Selected[0] != '' && this.obj.traitSelected == undefined ){
						this.obj.sel = 'sp';
						$('#' + this.id + 'ch-HUC8').val(this.obj.huc8Sel).trigger('chosen:updated').trigger('change');
					}
					$('#' + this.id + 'graphHide').trigger('click');
					$('#' + this.id + 'chartHeader').text("Please choose a HUC8");
					// update css to show that it is clicked
					$('#' + this.id + 'spaBtn').addClass('navBtnSel');
					$('#' + this.id + 'temBtn').removeClass('navBtnSel');
					this.map.graphics.clear();
					this.map.removeLayer(this.samplingStations);
					$('#' + this.id + 'temporalWrapper').slideUp();
					$('#' + this.id + 'graphHide, #' + this.id + 'graphShow').hide();
					$('#' + this.id + 'spatialWrapper, #' + this.id + 'huc8Wrapper').slideDown();
					console.log(this.obj.yearSelected);
					if (this.obj.yearSelected != undefined){
						this.obj.visibleLayers = [2, this.obj.yearSelected];
					}else{
						this.obj.visibleLayers = [2]
					}
					this.dynamicLayer.setVisibleLayers(this.obj.visibleLayers);
					$(this.con).animate({ height: '515px', width: '350px' }, 250,
						lang.hitch(this,function(){
							this.resize();
						})
					);
				}));

				// handle clicks on internal temporal button
				$('#' + this.id + 'temBtn').on('click',lang.hitch(this,function(){
					// update css to show that it is clicked
					$('#' + this.id + 'temBtn').addClass('navBtnSel');
					$('#' + this.id + 'spaBtn').removeClass('navBtnSel');
					this.obj.sel = "tm"
					$('#' + this.id + 'spatialWrapper, #' + this.id + 'graphDiv').hide();
					$('#' + this.id + 'temporalWrapper, #' + this.id + 'showGraphText').show();
					// remove spatial raster layer when internal temporal button is clicked
					//this.map.addLayer(this.samplingStations);
					console.log(this.obj.huc8Selected);
					if(this.obj.huc8Selected[0] != undefined){
						this.obj.visibleLayers = [2, 0];
					}else{
						this.obj.visibleLayers = [2];
					}
					
					this.dynamicLayer.setVisibleLayers(this.obj.visibleLayers);
					$(this.con).animate({ height: '430px', width: '350px' }, 250,
						lang.hitch(this,function(){
							this.resize();
						})
					);
				}));
				// Handle clicks on spatial button
				$('#' + this.id + 'spatial').on('click',lang.hitch(this,function(){
					// update css to show that it is clicked
					$('#' + this.id + 'spaBtn').addClass('navBtnSel');
					$('#' + this.id + 'temBtn').removeClass('navBtnSel');
					this.obj.sel = "sp"
					this.map.removeLayer(this.samplingStations);
					$('#' + this.id + 'graphHide, #' + this.id + 'graphShow').hide();
					$('#' + this.id + 'home').slideUp();
					$('#' + this.id + 'topWrapper, #' + this.id + 'hucWrapper, #' + this.id + 'huc8Wrapper').slideDown();
					//this.addHuc8();
					this.obj.visibleLayers = [2];
					this.dynamicLayer.setVisibleLayers(this.obj.visibleLayers);
					
					$(this.con).animate({ height: '515px', width: '350px' }, 250,
						lang.hitch(this,function(){
							this.resize();
						})
					);
				}));
				// Handle clicks on temporal button
				$('#' + this.id + 'temporal').on('click',lang.hitch(this,function(){
					// update css to show that it is clicked
					$('#' + this.id + 'temBtn').addClass('navBtnSel');
					$('#' + this.id + 'spaBtn').removeClass('navBtnSel');
					this.obj.sel = "tm"
					//this.map.addLayer(this.samplingStations);
					//this.addHuc8();
					this.obj.visibleLayers = [2];
					this.dynamicLayer.setVisibleLayers(this.obj.visibleLayers);
					$('#' + this.id + 'graphDiv').hide();
					$('#' + this.id + 'graphHide, #' + this.id + 'graphShow, #' + this.id + 'graphDiv').hide();
					$('#' + this.id + 'home, #' + this.id + 'spatialWrapper').slideUp();
					$('#' + this.id + 'showGraphText').show();
					$('#' + this.id + 'topWrapper, #' + this.id + 'hucWrapper, #' + this.id + 'temporalWrapper, #' + this.id + 'huc8Wrapper').slideDown();
					$(this.con).animate({ height: '430px', width: '350px' }, 250,
						lang.hitch(this,function(){
							this.resize();
						})
					);
				}));
				// handle clicks on Impaired watersheds button
				$('#' + this.id + 'impWatersheds').on('click',lang.hitch(this,function(){
					console.log('Impaired watersheds click');
					//this.map.addLayer(this.impWater);
					this.obj.visibleLayers = [3];
					this.dynamicLayer.setVisibleLayers(this.obj.visibleLayers);
					$('#' + this.id + 'home, #' + this.id + 'spatialWrapper, #' + this.id + 'huc8Wrapper').slideUp();
					// $('#' + this.id + 'topWrapper, #' + this.id + 'impWaterWrapper').slideDown();
					$('#' + this.id + 'clearWrapper, #' + this.id + 'hucWrapper').slideDown();
					$(this.con).animate({ height: '450px', width: '600px' }, 250,
						lang.hitch(this,function(){
							this.resize();
						})
					);
				}));

				// clear button clicks
				$('#' + this.id + 'clearBtn').on('click',lang.hitch(this,function(){
					this.map.graphics.clear();
					$('#' + this.id + 'cb-none, #' + this.id + 'graphHide').trigger("click");
					$('#' + this.id + 'graphShow').hide();
					$('#' + this.id + 'ch-traitsDiv, #' + this.id + 'ch-yearsDiv').slideUp();
					this.map.setExtent(this.dynamicLayer.initialExtent, true);
					// just keep the Huc 8 displayed
					this.obj.sel = "";
					$('#' + this.id + 'ch-HUC8').val('').trigger('chosen:updated').trigger('change');
					$('#' + this.id + 'topWrapper, #' + this.id + 'supData, #' + this.id + 'temporalWrapper, #' + this.id + 'hucWrapper').slideUp();
					$('#' + this.id + 'bottomDiv').hide();
					$('#' + this.id + 'home').slideDown();
					this.obj.traitSelected = undefined;
					this.map.removeLayer(this.samplingStations);
					this.map.removeLayer(this.huc8);
					this.map.removeLayer(this.impWater);
					this.obj.visibleLayers = []
					this.dynamicLayer.setVisibleLayers(this.obj.visibleLayers);
					$(this.con).animate({ height: '200px', width: '350px' }, 250,
						lang.hitch(this,function(){
							this.resize();
						})
					);
				}));
				// clear impaired watersheds table
				$('#' + this.id + 'clearWaterBtn').on('click',lang.hitch(this,function(){
					this.map.graphics.clear();
					this.map.setExtent(this.dynamicLayer.initialExtent, true);
					$('#' + this.id + 'hucWrapper, #' + this.id + 'clearWrapper').slideUp();
					$('#' + this.id + 'bottomDiv').hide();
					$('#' + this.id + 'home').slideDown();
					$('#' + id + 'waterAttributes').hide();
					$('#' + id + 'impWaterWrapper').hide();
					this.map.removeLayer(this.impWater);
					$(this.con).animate({ height: '200px', width: '350px' }, 250,
						lang.hitch(this,function(){
							this.resize();
						})
					);
				}));
				// Add dynamic map service
				this.dynamicLayer = new ArcGISDynamicMapServiceLayer(this.obj.url, {opacity: 1 - this.obj.sliderVal/10});
				this.map.addLayer(this.dynamicLayer);
				this.dynamicLayer.on("load", lang.hitch(this, function () {
					if (this.obj.extent == ""){
						this.map.setExtent(this.dynamicLayer.initialExtent, true);
					}else{
						var extent = new Extent(this.obj.extent.xmin, this.obj.extent.ymin, this.obj.extent.xmax, this.obj.extent.ymax, new SpatialReference({ wkid:4326 }))
						this.map.setExtent(extent, true);
						this.obj.extent = "";
					}
					if (this.obj.visibleLayers.length > 0){
						this.dynamicLayer.setVisibleLayers(this.obj.visibleLayers);
						this.spid = this.obj.visibleLayers[0];
					}
					this.layersArray = this.dynamicLayer.layerInfos;
				}));
				this.dynamicLayer.on("update-end", lang.hitch(this,function(e){
					if (e.target.visibleLayers.length > 1){
						if (this.obj.sel.length > 0 ){
							$('#' + this.id + 'bottomDiv').show();
						}
					}else{
						$('#' + this.id + 'bottomDiv').hide();
					}
				}));
				$('#' + this.appDiv.id + 'slider').slider({ min: 0,	max: 10, value: this.obj.sliderVal });
				$('#' + this.appDiv.id + 'slider').on( "slidechange", lang.hitch(this,function( e, ui ) {
					this.obj.sliderVal = ui.value;
					this.dynamicLayer.setOpacity(1 - ui.value/10);
					this.land.setOpacity(1 - ui.value/10);
					this.soils.setOpacity(1 - ui.value/10);
				}));
				this.resize();
				// Setup hover window for 20 largest parcels (as points)
				this.map.infoWindow.resize(225,125);
        		this.dialog = new TooltipDialog({
				  id: "tooltipDialog",
				  style: "position: absolute; width: 230px; font: normal normal normal 10pt Helvetica;z-index:100"
				});
				this.dialog.startup();
				// Enable jquery plugin 'chosen'
				require(["jquery", "plugins/water-quality/js/chosen.jquery"],lang.hitch(this,function($) {
					var configCrs =  { '.chosen-crs' : {allow_single_deselect:true, width:"200px", disable_search:false}}
					for (var selector in configCrs)  { $(selector).chosen(configCrs[selector]); }
				}));

				// Use selections on chosen menus
				var p = ""
				require(["jquery", "plugins/water-quality/js/chosen.jquery"],lang.hitch(this,function($) {
					//Select Huc8
					$('#' + this.id + 'ch-HUC8').chosen().change(lang.hitch(this,function(c, p){
						// clear traits value if huc 8 dropdown menu was cleared
						p = $('#' + this.id + 'ch-HUC8').val()
						console.log(p, 'p');
						this.obj.traitSelected = undefined;
						this.obj.huc8Selected[0] = '';
						var traitArray = [];
						$('#' + this.id + 'ch-traits').val('').trigger('chosen:updated').trigger('change');
						$('#' + this.id + 'cb-none').trigger("click");
						this.map.setExtent(this.dynamicLayer.initialExtent, true);
						$('#' + this.id + 'ch-traits').empty();
						if(p){
							this.obj.visibleLayers = [2];
							this.dynamicLayer.setVisibleLayers(this.obj.visibleLayers);
							console.log(this.layersArray.name)
							$('#' + this.id + 'ch-traits').val('').trigger('chosen:updated');
							var val = $('#' + this.id + 'ch-HUC8').val();
							$('#' + this.id + 'ch-traitsDiv').show();
							this.obj.huc8Selected = c.currentTarget.value.split("_");
							this.obj.huc8Sel = c.currentTarget.value;
							if(this.obj.sel == "sp"){
								$('#' + this.id + 'supData, #' + this.id + 'spatialWrapper').slideDown();
								// something was selected
								$.each(this.layersArray, lang.hitch(this,function(i,v){
									var splitStr = v.name.split("_");
									if (this.obj.huc8Selected[0] == splitStr[0]){
										traitArray.push(splitStr[1]);
									}
								}));
								//clear the text var
								traitArray = unique(traitArray);
								//append intital empty option
								$('#' + this.id + 'ch-traits').append('<option value=""></option>');
								//use lang.hitch so the 'this' object is available for the append
								$.each(traitArray, lang.hitch(this, function(i,v){
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
									if(v == "NH3"){
										traitText = "Ammonia";
									}
									if(v == "ION"){
										traitText = "Inorganic Nitrogen";
									}
									if (traitText != ''){
										//you have to use this.id to get the element (won't work without lang.hitch above
										$('#' + this.id + 'ch-traits').append('<option value="' + v + '">' + traitText + '</option>');
									}
								}));
								//after the loop trigger an update to the select menu
								$('#' + this.id + 'ch-traits').trigger("chosen:updated");
								$('#' + this.id + 'ch-traitsDiv').slideDown();
								$('#' + this.id + 'graphHide, #' + this.id + 'graphShow').hide();
							};
							if(this.obj.sel == "tm"){
								$('#' + this.id + "supData").slideDown();
								this.obj.visibleLayers = [2, 0];
								this.dynamicLayer.setVisibleLayers(this.obj.visibleLayers);
							}
							this.selectHuc8 = new Query();
							this.selectHuc8.where = "HUC_8 = '" + this.obj.huc8Selected[1] + "'";
							this.huc8.selectFeatures(this.selectHuc8, FeatureLayer.SELECTION_NEW);
						} else{
							$('#' + this.id + 'supData').slideUp();
							var ch = $('#' + this.id + 'spatialWrapper').find('.ch-divs');
							$.each(ch, lang.hitch(this, function(i, v){
								$('#' + v.id).hide();
							}));
						}
					}));
					// build the yearArray for the year select menu after change in traits menu
					$('#' + this.id + 'ch-traits').chosen().change(lang.hitch(this,function(c, t){
						// clear years value if traits dropdown menu was cleared
						$('#' + this.id + 'ch-years').val('').trigger('chosen:updated').trigger('change');
						// something was selected from traits dropdown.
						if(t) {
							this.obj.visibleLayers = [2];
							this.dynamicLayer.setVisibleLayers(this.obj.visibleLayers);
							// append empty option as first value
							$('#' + this.id + 'ch-years').append('<option value=""></option>');
							// assign traitSelected to the huc 8 + t.selected
							this.obj.traitSelected = this.obj.huc8Selected[0] + "_" + t.selected;
							// loop through layers array
							$.each(this.layersArray, lang.hitch(this,function(i,v){
								var wn = v.name
								var n = wn.substring(0, wn.length - 5)
								if (n == this.obj.traitSelected){
									var y = wn.slice(-4)
									$('#' + this.id + 'ch-years').append('<option value="' + v.id + '">' + y + '</option>');
								}
							}));
							$('#' + this.id + 'ch-years').trigger("chosen:updated");
							$('#' + this.id + 'ch-yearsDiv').slideDown();
						} else{
							$('#' + this.id + 'ch-years').val('').trigger("chosen:updated");
							$('#' + this.id + 'ch-yearsDiv').slideUp();
						};
					}));
					$('#' + this.id + 'ch-years').chosen().change(lang.hitch(this,function(c, v){
						if(v){
							$('#' + this.id + 'ch-pointsDiv').slideDown();
							this.obj.yearSelected = v.selected;
							this.obj.visibleLayers = [2, this.obj.yearSelected];
							this.dynamicLayer.setVisibleLayers(this.obj.visibleLayers);
							var lyrName = '';
							$.each(this.layersArray, lang.hitch(this,function(i,v){
								if(v.id == this.obj.yearSelected){
									lyrName = v.name;
									return false;
								}
							}));
							this.samplePoints.setDefinitionExpression("raster = '" + lyrName + "'");
						} else{
							$('#' + this.id + 'ch-years').empty();
							$('#' + this.id + 'ch-pointsDiv').hide();
							this.obj.yearSelected = undefined;
							this.obj.visibleLayers = [2, this.obj.yearSelected];
							this.dynamicLayer.setVisibleLayers(this.obj.visibleLayers);
							$('#' + this.id + 'ch-points').prop( "checked", false ).trigger('change');

						}
					}));
					// work with sample points checkbox
					$('#' + this.id + 'ch-points').on('change',lang.hitch(this,function(v){
						var lyrName = '';
						if(v.currentTarget.checked == true){
							this.map.addLayer(this.samplePoints);
						}else{
							this.map.removeLayer(this.samplePoints);
						}
					}));

					// this function removes duplicates from any list, used above on the traitArray
					function unique(list){
						var result = [];
						$.each(list, function(i, e){
							if ($.inArray(e, result) == -1) result.push(e);
						});
						return result;
					};
				}));
				var id = this.id;
				// work with clicks on impaired watersheds and populate table with data from the attribute table
				this.impWater.on("click", lang.hitch(function(evt){
					$('#' + id + 'tableTest').empty();
					$('#' + id + 'tableTest').append('<tr><th>Impairment</th><th>Suspected Cause</th><th>Suspected Source</th></tr>');
					var waterName = evt.graphic.attributes.NAME;
					var waterDesc = evt.graphic.attributes.DESCRIPTIO;
					var waterID = evt.graphic.attributes.SUBSEGME_1;
					var allUse = evt.graphic.attributes.AllUse;
					console.log(allUse);
					var splitAllUse = allUse.split('],');
					for (i = 0; i < splitAllUse.length; i++) { 
						var item = splitAllUse[i];
						item = item.split(/['']/);
						console.log(i, item);
						$('#' + id + 'tableTest').append('<tr><td>' + item[1] + '</td> <td>' + item[3] + '</td> <td>' + item[5] + '</td></tr>');
					}
					$('#' + id + 'waterAttributes').slideDown();
					$('#' + id + 'impWaterWrapper').slideDown();
					var html = $('#' + id + 'waterName').html("<b>Watershed Name:</b> " + waterName);
					var html = $('#' + id + 'waterDesc').html("<b>Watershed Description:</b> " + waterDesc);
					var html = $('#' + id + 'waterID').html("<b>Watershed ID:</b> " + waterID);
				}));

				// work with sup radio buttons
				$('#' + this.id + 'supDataDiv input:radio').on('click', lang.hitch(this,function(c){
					var map = this.map
					// write a function here to see if the layers exist, if they do remove them
					this.map.removeLayer(this.huc12);
					this.map.removeLayer(this.soils);
					// this.map.removeLayer(this.land);
					$('#' + this.id + 'clickHuc12').hide();
					$('#' + this.id + 'clickHuc12').html('');
					$('#' + this.id + 'clickSoils').hide();
					$('#' + this.id + 'clickSoils').html('');
					map.graphics.clear();
					// if value is Huc 12 set the layer to on
					if (c.currentTarget.value == "HUC 12s"){
						this.huc12.setDefinitionExpression("HUC_8 = '" + this.obj.huc8Selected[1] + "'");
						this.map.addLayer(this.huc12, this.samplingStations);
						if (this.obj.visibleLayers.length < 2 ){
							$('#' + this.id + 'bottomDiv').hide();
						}
					}
					// work with the huc12 popup
					// huc12 popup
					this.huc12.on("mouse-over", lang.hitch(this,function(evt){
						this.map.setMapCursor("pointer");
						console.log(evt)
					}));
					this.huc12.on("mouse-out", lang.hitch(this,function(evt){
						this.map.setMapCursor("default");
					}));
					this.huc12.on("click", lang.hitch(this,function(evt){
						$('#' + this.id + 'clickHuc12').show();
						atts = evt.graphic.attributes;
						this.map.graphics.clear();
						this.huc12Graphic = new Graphic(evt.graphic.geometry,this.huc12Sym);
						this.map.graphics.add(this.huc12Graphic);
						var acres = numberWithCommas(evt.graphic.attributes.ACRES)
						var t = "<div style='padding:6px;'>HUC 12: <b>${HUC_12}</b><br>Acres: <b>" + acres + "</b><br>Subwatershed: <b>${SUBWATERSHED}</b></div>";
						var content = esriLang.substitute(evt.graphic.attributes,t);
						console.log(content);
						$('#' + this.id + 'clickHuc12').html(content);

					}));
					// if value is soils set the layer to on
					if (c.currentTarget.value == "Soils Data"){
						var soilID = '';
						var soilLayer = this.obj.huc8Selected[0] + '_soils' + "_web"
						$.each(this.layersArray, lang.hitch(this,function(i,v){
							var layerName = v.name
							if (this.obj.huc8Selected[0] + '_soils' + "_web" == layerName){
								soilID = v.id;
								return false;
							}
						}));
						this.soils = new FeatureLayer(this.obj.url + "/" + soilID, { mode: esri.layers.FeatureLayer.MODE_SNAPSHOT, outFields: "*"});
						this.soils.setRenderer(new SimpleRenderer(this.soilsSym));
						console.log(this.map)
						this.map.removeLayer(this.huc8);
						this.map.addLayer(this.soils, this.samplingStations);
						this.map.addLayer(this.huc8);
						if (this.obj.visibleLayers.length < 2 ){
							$('#' + this.id + 'bottomDiv').hide();
						}
					}
					// work with the soils popup
					// soils popup
					this.soils.on("mouse-over", lang.hitch(this,function(evt){
						this.map.setMapCursor("pointer");
					}));
					this.soils.on("mouse-out", lang.hitch(this,function(evt){
						this.map.setMapCursor("default");
					}));
					this.soils.on("click", lang.hitch(this,function(evt){
						$('#' + this.id + 'clickSoils').show();
						atts = evt.graphic.attributes;
						this.map.graphics.clear();
						this.soilsGraphic = new Graphic(evt.graphic.geometry,this.soilsSym);
						this.map.graphics.add(this.soilsGraphic);
						var t = "<div style='padding:6px;'>Soil Type: <b>${Map_unit_n}</b></div>";
						var content = esriLang.substitute(evt.graphic.attributes,t);
						console.log(content);
						$('#' + this.id + 'clickSoils').html(content);

					}));
					if (c.currentTarget.value == "Land Cover"){
						var landID = '';
						$.each(this.layersArray, lang.hitch(this,function(i,v){
							if (this.obj.huc8Selected[0] + ' Land Cover' == v.name){
								landID = v.id;
								return false;
							}
						}));
						console.log(landID);
						this.land = new FeatureLayer(this.obj.url + "/" + landID, { mode: esri.layers.FeatureLayer.MODE_SNAPSHOT, outFields: "*"});
						this.land.setRenderer(new SimpleRenderer(this.hucSym));
						this.map.addLayer(this.land);
						console.log(this.land)
						// this.land.setVisibleLayers([landID])
						// this.map.addLayer(this.land);
						$('#' + this.id + 'bottomDiv').show();
					}
					if (c.currentTarget.value == "None"){
						if (this.obj.visibleLayers.length < 2 ){
							$('#' + this.id + 'bottomDiv').hide();
						}
					}
				}));
				// work with the soils popup
					// soils popup
					soilsDialog = new TooltipDialog({
					  style: "position: absolute; max-width: 250px; font: normal normal normal 10pt Helvetica; z-index:100;"
					});
					soilsDialog.startup();
					this.soils.on("mouse-over", lang.hitch(this,function(evt){
						this.map.setMapCursor("pointer");
					}));
					this.soils.on("mouse-out", lang.hitch(this,function(evt){
						this.map.setMapCursor("default");
					}));
					this.soils.on("click", lang.hitch(this,function(evt){
						$('#' + this.id + 'clickSoils').show();
						atts = evt.graphic.attributes;
						this.map.graphics.clear();
						this.soilsGraphic = new Graphic(evt.graphic.geometry,this.soilsSym);
						this.map.graphics.add(this.soilsGraphic);
						var t = "<div style='padding:6px;'>Soil Type: <b>${Map_unit_n}</b></div>";
						var content = esriLang.substitute(evt.graphic.attributes,t);
						console.log(content);
						$('#' + this.id + 'clickSoils').html(content);

					}));
					// this.soils.on("mouse-out", lang.hitch(function(evt){
						// this.map.setMapCursor("default");
						// map.graphics.clear();
						// dijitPopup.close();
					// }));
				this.rendered = true;
			},
			// add huc8 and on huc8 load add click events
			addHuc8: function(){
				this.map.addLayer(this.huc8);
				var id =  this.id;
				this.huc8.on("click", lang.hitch(function(evt){
					var huc8ClickVal = evt.graphic.attributes.Abbr + '_' + evt.graphic.attributes.HUC_8
					$('#' + id + 'ch-HUC8').val(huc8ClickVal).trigger('chosen:updated').trigger('change');
				}));
			},
			checkTraits: function(atts){
				var c = $('#' + this.id + 'meanBarDiv').find('.meanBars')
				$.each(c, function(i, v){
					$('#' + v.id).removeClass('selBar');
				});

				var ta = ["generated_stations_DOmean", "generated_stations_Nmean", "generated_stations_Pmean",
				"generated_stations_TDSmean", "generated_stations_TSSmean", "generated_stations_TURmean",
				"generated_stations_PHOmean", "generated_stations_IONmean", "generated_stations_AMMmean", "generated_stations_NITmean"]
				var taIn = []
				$.each(ta, lang.hitch(this,function(i,v){
					a = JSON.parse(atts[v])
					$.each(a, lang.hitch(this,function(j,w){
						if (w != -99){
							taIn.push(v)
							return false
						}
					}));
				}))
				var taOut = $(ta).not(taIn).get();
				this.obj.tid = ""
				$.each(taIn, lang.hitch(this,function(i,v){
					$('#' + this.id + '-' + v).prop('disabled', false);
					if (v == this.obj.trait + "mean"){
						this.obj.tid = v
					}
				}));
				$.each(taOut, lang.hitch(this,function(i,v){
					$('#' + this.id + '-' + v).prop('disabled', true);
				}));
				if (this.obj.tid == ""){
					this.obj.tid = taIn[0]
				}
				var val = this.obj.tid.slice(0,-4) + "value"
				this.obj.mean = JSON.parse(this.obj.spAtts[this.obj.tid])
				this.obj.val = JSON.parse(this.obj.spAtts[val])
				var a = this.massageArray()
				this.updateChart(a)
				var btnch = $('#' + this.id + 'traitBar').find('.buttonBar__button');
				$.each(btnch, function(i,v){
					$('#' + v.id).removeClass('buttonBar__selected')
				})
				$('#' + this.id + "-" + this.obj.tid).addClass('buttonBar__selected');
			},
			massageArray: function(){
				var a = []
				var num = 1
				this.obj.rangeNum = 0
				var lar = Math.max.apply(Math, this.obj.mean);
				if (this.obj.tid == "generated_stations_DOmean"){
					num = 12
					this.obj.rangeNum = 12
					$('#' + this.id + 'hLbl').html('12mg/L')
					$('#' + this.id + 'mLbl').html('9mg/L')
					$('#' + this.id + 'lLbl').html('6mg/L')
					$('#' + this.id + 'uLbl').html('3mg/L')
				}
				if (this.obj.tid == "generated_stations_Nmean"){
					num = 6
					this.obj.rangeNum = 6
					$('#' + this.id + 'hLbl').html('6mg/L')
					$('#' + this.id + 'mLbl').html('4.5mg/L')
					$('#' + this.id + 'lLbl').html('3mg/L')
					$('#' + this.id + 'uLbl').html('1.5mg/L')
				}
				if (this.obj.tid == "generated_stations_Pmean"){
					num = 0.8
					this.obj.rangeNum = 0.8
					$('#' + this.id + 'hLbl').html('0.8mg/L')
					$('#' + this.id + 'mLbl').html('0.6mg/L')
					$('#' + this.id + 'lLbl').html('0.4mg/L')
					$('#' + this.id + 'uLbl').html('0.2mg/L')
				}
				if (this.obj.tid == "generated_stations_TDSmean"){
					num = 20000
					this.obj.rangeNum = 20000
					$('#' + this.id + 'hLbl').html('20,000mg/L')
					$('#' + this.id + 'mLbl').html('15,000mg/L')
					$('#' + this.id + 'lLbl').html('10,000mg/L')
					$('#' + this.id + 'uLbl').html('5,000mg/L')
				}
				if (this.obj.tid == "generated_stations_TSSmean"){
					num = 200
					this.obj.rangeNum = 200
					$('#' + this.id + 'hLbl').html('200mg/L')
					$('#' + this.id + 'mLbl').html('150mg/L')
					$('#' + this.id + 'lLbl').html('100mg/L')
					$('#' + this.id + 'uLbl').html('50mg/L')
				}
				if (this.obj.tid == "generated_stations_TURmean"){
					num = 500
					this.obj.rangeNum = 500
					$('#' + this.id + 'hLbl').html('500 NTU')
					$('#' + this.id + 'mLbl').html('375 NTU')
					$('#' + this.id + 'lLbl').html('250 NTU')
					$('#' + this.id + 'uLbl').html('125 NTU')
				}
				if (this.obj.tid == "generated_stations_PHOmean"){
					num = 200
					this.obj.rangeNum = 200
					$('#' + this.id + 'hLbl').html('1mg/L')
					$('#' + this.id + 'mLbl').html('.75mg/L')
					$('#' + this.id + 'lLbl').html('.50mg/L')
					$('#' + this.id + 'uLbl').html('.25mg/L')
				}
				if (this.obj.tid == "generated_stations_IONmean"){
					num = 6
					this.obj.rangeNum = 6
					$('#' + this.id + 'hLbl').html('6mg/L')
					$('#' + this.id + 'mLbl').html('4.5mg/L')
					$('#' + this.id + 'lLbl').html('3mg/L')
					$('#' + this.id + 'uLbl').html('1.5mg/L')
				}
				if (this.obj.tid == "generated_stations_AMMmean"){
					num = 3
					this.obj.rangeNum = 3
					$('#' + this.id + 'hLbl').html('3mg/L')
					$('#' + this.id + 'mLbl').html('2.25mg/L')
					$('#' + this.id + 'lLbl').html('1.5mg/L')
					$('#' + this.id + 'uLbl').html('.75mg/L')
				}
				if (this.obj.tid == "generated_stations_NITmean"){
					num = 2
					this.obj.rangeNum = 2
					$('#' + this.id + 'hLbl').html('2mg/L')
					$('#' + this.id + 'mLbl').html('1.5mg/L')
					$('#' + this.id + 'lLbl').html('1mg/L')
					$('#' + this.id + 'uLbl').html('.5mg/L')
				}
				$.each(this.obj.mean, function(i, v) {
					if (v == -99){
						a.push(0)
					}else{
						var n = v / num * 100
						if (n < 2){ n = 2 }
						a.push(n)
					}
				})
				return a
			},

			updateChart: function(a){
				$('#' + this.id + 'mean1995').animate({ 'height': a[0] + '%'});
				$('#' + this.id + 'mean1996').animate({ 'height': a[1] + '%'});
				$('#' + this.id + 'mean1997').animate({ 'height': a[2] + '%'});
				$('#' + this.id + 'mean1998').animate({ 'height': a[3] + '%'});
				$('#' + this.id + 'mean1999').animate({ 'height': a[4] + '%'});
				$('#' + this.id + 'mean2000').animate({ 'height': a[5] + '%'});
				$('#' + this.id + 'mean2001').animate({ 'height': a[6] + '%'});
				$('#' + this.id + 'mean2002').animate({ 'height': a[7] + '%'});
				$('#' + this.id + 'mean2003').animate({ 'height': a[8] + '%'});
				$('#' + this.id + 'mean2004').animate({ 'height': a[9] + '%'});
				$('#' + this.id + 'mean2005').animate({ 'height': a[10] + '%'});
				$('#' + this.id + 'mean2006').animate({ 'height': a[11] + '%'});
				$('#' + this.id + 'mean2007').animate({ 'height': a[12] + '%'});
				$('#' + this.id + 'mean2008').animate({ 'height': a[13] + '%'});
				$('#' + this.id + 'mean2009').animate({ 'height': a[14] + '%'});
				$('#' + this.id + 'mean2010').animate({ 'height': a[15] + '%'});
				$('#' + this.id + 'mean2011').animate({ 'height': a[16] + '%'});
				$('#' + this.id + 'mean2012').animate({ 'height': a[17] + '%'});
				$('#' + this.id + 'mean2013').animate({ 'height': a[18] + '%'});
				$('#' + this.id + 'mean2014').animate({ 'height': a[19] + '%'}, 1000, "linear", lang.hitch(this,function() {
				this.checkSelectedBar();
				}));
			},
			checkSelectedBar: function(){
				var c = $('#' + this.id + 'meanBarDiv').find('.meanBars')
				var keepYear = ""
				outYears = []
				$.each(c, lang.hitch(this,function(i, v){
					if ($('#' + v.id).height() > 0){
						if (v.id.substr(v.id.length - 4) == this.obj.year){
							keepYear = this.obj.year
							$('#' + v.id).addClass('selBar');
						}
					}else{
						outYears.push(v.id.substr(v.id.length - 4))
					}
				}));
				var sl = $('#' + this.id + 'smLabelDiv').find('.slText')
				$.each(sl, lang.hitch(this,function(i,v){
					$(v).parent('.smallLabels').removeClass('dis')
					$(v).removeClass('disText')
				}));
				$.each(sl, lang.hitch(this,function(i,v){
					$.each(outYears, lang.hitch(this,function(j,w){
						if ($(v).html() == w){
							$(v).parent('.smallLabels').addClass('dis')
							$(v).addClass('disText')
						}
					}));
				}));
				if (keepYear != ""){
					this.obj.year = keepYear
				}else{
					var yid = ""
					$.each(c, function(i, v){
						$('#' + v.id).removeClass('selBar');
					})
					$.each(c, function(i, v){
						if ($('#' + v.id).height() > 0){
							$('#' + v.id).addClass('selBar');
							yid = v.id
							return false
						}
					});
					this.obj.year = yid.substr(yid.length - 4);
				}
				var c1 = $('#' + this.id + 'smLabelDiv').find('.slText')
				$.each(c1, lang.hitch(this,function(i, v){
					if ($(v).html() == this.obj.year){
						$(v).parent('.smallLabels').addClass('buttonBar__selected')
					}else{
						$(v).parent('.smallLabels').removeClass('buttonBar__selected')
					}
				}));

				this.updateLineChart()
			},

			updateLineChart: function(){
				var d = []
				$.each(this.obj.val, lang.hitch(this,function(i,v){
					if (this.obj.year == v[0]){
						d = v
					}
				}));
				$.each(d, function(i,v){
					if (v == -99){
						d[i] = null;
					}
				});
				var e = d.slice(1)
				var data = {
				  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
				  series: [e]
				};
				var options = {
				  width: 580,
				  height: 145
				};
				new Chartist.Line('#' + this.id + 'lineChart', data, options);
				var units = "(mg/L)"
				if (this.obj.tid == "generated_stations_TURmean"){
					units = "(NTU)"
				}
				$('#' + this.id + 'lineChartTitle').html("Monthly Readings Taken in " + this.obj.year + " " + units)
			},
			clearItems: function(){
				// $.each( ($('#' + this.id + 'step3').find('.supCB')), lang.hitch(this,function(i,v){
					// if (v.checked == true){
						// $('#' + v.id).trigger('click');
					// }
				// }));
				this.map.graphics.clear();
			}
		});
	});
function commaSeparateNumber(val){
    while (/(\d+)(\d{3})/.test(val.toString())){
		val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
	}
	return val;
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
