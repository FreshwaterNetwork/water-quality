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
	"plugins/water-quality/chartist/chartist", "./test", "./test1", "./test2", "./impWatersheds", "./graphClicks", "./supportingData", "./navigation", "./dropdown","./mapClicks","./saveState",
],
function ( ArcGISDynamicMapServiceLayer, Extent, SpatialReference, Query, QueryTask, PictureMarkerSymbol, TooltipDialog, dijitPopup,
	declare, PluginBase, FeatureLayer, SimpleLineSymbol, SimpleFillSymbol, esriLang, Geoprocessor, SimpleMarkerSymbol, Graphic, Color,
	ContentPane, HorizontalSlider, dom, domClass, domStyle, domConstruct, domGeom, lang, on, parser, ConstrainedMoveable, config, $,
	legendContent, content, ui, SimpleRenderer, Chartist, test, test1, test2, impWatersheds, graphClicks, supportingData, navigation, dropdown, mapClicks, saveState) {
		return declare(PluginBase, {
			// The height and width are set here when an infographic is defined. When the user click Continue it rebuilds the app window with whatever you put in.
			toolbarName: "Water Quality", showServiceLayersInLegend: true, allowIdentifyWhenActive: false, rendered: false, resizable: false,
			hasCustomPrint: true, usePrintPreviewMap: true, previewMapSize: [1000, 550], height:"250", width:"350",
			// Comment out the infoGraphic property below to make that annoying popup go away when you start the app
			infoGraphic: "plugins/water-quality/images/infoGraphic.jpg",
			// 
// INITIALIZE FUNCTION /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// First function called when the user clicks the pluging icon.
			initialize: function (frameworkParameters) {
				this.tt = 'yes';
				// Access framework parameters
				declare.safeMixin(this, frameworkParameters);
				// Set initial app size based on split screen state
				this.con = dom.byId('plugins/water-quality-0');
				this.con1 = dom.byId('plugins/water-quality-1');
				if (this.con1 != undefined){
					domStyle.set(this.con1, "width", "350px");
					domStyle.set(this.con1, "height", "250px");
				}else{
					domStyle.set(this.con, "width", "350px");
					domStyle.set(this.con, "height", "250px");
				}
				// Define object to access global variables from JSON object. Only add variables to varObject.json that are needed by Save and Share.
				this.obj = dojo.eval("[" + config + "]")[0];
			},
			
// HIBERNATE FUNCTION /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// Called after initialize at plugin startup (why all the tests for undefined). Also called after deactivate when user closes app by clicking X.
			hibernate: function () {
				if (this.appDiv != undefined){
					$('#' + this.id + 'cb-none').trigger('click');
					$('#' + this.id + 'clearBtn').trigger('click')
					// this.obj.sel = '';
					// this.map.graphics.clear();
					// this.map.removeLayer(this.land);
					// this.map.removeLayer(this.dynamicLayer);
					// this.map.removeLayer(this.streams);
					// this.map.removeLayer(this.huc12);
					// this.map.removeLayer(this.soils);
					// this.map.removeLayer(this.samplingStations);
					// this.map.removeLayer(this.huc8);
					// this.map.removeLayer(this.huc8_click);
					// this.map.removeLayer(this.impWater);
					// this.map.removeLayer(this.sampPoint);
					// this.map.graphics.clear();
					// this.obj.visibleLayers = []
					// this.dynamicLayer.setVisibleLayers(this.obj.visibleLayers);
					$(this.container).empty();
					this.rendered = false;
				}
			},
// ACTIVATE FUNCTION /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// Called after hibernate at app startup. Calls the render function which builds the plugins elements and functions.
			activate: function () {
				// Hide framework default legend
				if (this.rendered == false){
					this.rendered = true;
					this.render();
					// Hide the print button until a hex has been selected
					$(this.printButton).hide();
					this.dynamicLayer.setVisibility(true);
				}else{
					if (this.dynamicLayer != undefined){
						this.dynamicLayer.setVisibility(true);
						if (this.map.getZoom() > 12 ){
							this.map.setLevel(12)
						}
					}
				}
			},
			// Called when user hits the minimize '_' icon on the pluging. Also called before hibernate when users closes app by clicking 'X'.
			deactivate: function () {
			},
// GET STATE FUNCTION /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// Called when user hits 'Save and Share' button. This creates the url that builds the app at a given state using JSON.
			// Write anything to you varObject.json file you have tracked during user activity.
			getState: function () {
				this.obj.extent = this.map.geographicExtent;
				this.obj.stateSet = "yes";
				var state = new Object();
				state = this.obj;
				return state;


			},
			// Called before activate only when plugin is started from a getState url.
			//It's overwrites the default JSON definfed in initialize with the saved stae JSON.
			setState: function (state) {
				this.obj = state;
			},

// PRINT FUNCTION /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
			execute: function(){
				this.queryTask.execute(this.query, huc8Results);
			},
			huc8Results: function(results){
				var resultItems = [];
				var resultCount =  results.features.length;
			},
// START OF THE RENDER FUNCTION ////////////////////////////////////////////////////////////////////////////////////////////////////////
			render: function() {
				this.obj.extent = this.map.geographicExtent;
// BRING IN OTHER JS FILES ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
				// set variables for all other js files
				this.graphClicks = new graphClicks();
				this.supportingData = new supportingData();
				this.navigation = new navigation();
				this.dropdown = new dropdown();
				this.mapClicks = new mapClicks();
				this.saveState = new saveState();

// DEFINE CONTENT ///////////////////////////////////////////////////////////////////////////////////////////////////////////
				// Define Content Pane
				this.appDiv = new ContentPane({style:'padding:8px 8px 8px 8px'});
				this.id = this.appDiv.id;
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
// ENABLE TABLESORTER FUNCTION /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
				// Enable jquery plugin 'tablesorter'
				require(["jquery", "plugins/water-quality/js/tablesorter"],lang.hitch(this,function($) {
					$("#" + this.appDiv.id + "impTable").tablesorter({
						widthFixed : true,
						headerTemplate : '{content}', // Add icon for various themes

						widgets: [ 'zebra'],
						theme: 'blue',

						widgetOptions: {
							// jQuery selector or object to attach sticky header to
						}
					})
				}));
// ENABLE CHOOSEN FUNCTION /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
				// Enable jquery plugin 'chosen'
				require(["jquery", "plugins/water-quality/js/chosen.jquery"],lang.hitch(this,function($) {
					var configCrs =  { '.chosen-crs' : {allow_single_deselect:true, width:"200px", disable_search:false}}
					for (var selector in configCrs)  { $(selector).chosen(configCrs[selector]); }
				}));

// Populate huc 8 dropdown /////////////////////////////////////////////
				// create query task on the huc 8 table at app startup
				var queryTask = new QueryTask(this.obj.url + "/0")
				var query = new Query();
				query.returnGeometry = false;
				query.outFields = ["Abbr", "clean_names", "Ammonia", "DissolvedOxygen", "InorganicNitrogen", "Nitrate",
										"Phosphorus", "TotalDissolvedSolids", "TotalNitrogen", "TotalSuspendedSolids", "Turbidity"];
				query.where = "OBJECTID > -1"
				queryTask.execute(query, lang.hitch(this, function(results){
					var hucs = [];
					$.each(results.features,lang.hitch(this, function(i,v){
						hucs.push(v.attributes)
					}));
					hucs.sort(function(a,b) {return (a.clean_names > b.clean_names) ? 1 : ((b.clean_names > a.clean_names) ? -1 : 0);} ); 
					this.huc8s = hucs;
					$('#' + this.id + 'ch-HUC8').empty();
					$('#' + this.id + 'ch-HUC8').append("<option value=''></option>")
					$('#' + this.id + 'ch-HUC8').append("<option value='fullExtent'>Zoom to Full Extent</option>")
					$.each(this.huc8s, lang.hitch(this, function(i,v){
						$('#' + this.id + 'ch-HUC8').append("<option value='" + v.Abbr + "'>" + v.clean_names + "</option>")
					})); 
					$('#' + this.id + 'ch-HUC8').trigger("chosen:updated");
				}));

// SET SYMBOLOGY /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
						// soil symbol
				this.streamsSym = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
						new Color([0,46,115,0.5]),5);
						
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
				// huc 8 highlight symbol
				this.huc8highlightSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
						new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
						new Color([0,46,115]), 3),
						new Color([236,239,222,0]));
				this.sampleSym = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 13,
						new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
						new Color([	64, 140, 180]), 4),
						new Color([	200, 132, 29,0]));
				this.bankSym = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 15,
						new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
						new Color([	64, 140, 180]), 3),
						new Color([	200, 132, 29,0]));
				// imp watershed selection symbol
				this.impWaterShedSelectionN = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
						new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
						new Color([53, 154, 0]), 3),
						new Color([236,239,222,.15]));
				this.impWaterShedSelectionL = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
						new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
						new Color([216,216,0]), 3),
						new Color([236,239,222,.15]));
				this.impWaterShedSelectionM = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
						new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
						new Color([	216,144,0]), 3),
						new Color([236,239,222,.15]));
				this.impWaterShedSelectionH = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
						new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
						new Color([216,0,0]), 3),
						new Color([236,239,222,.15]));
// FEATURE LAYERS /////////////////////////////////////////////////////////////////////////////////////////////////////////
				// set all feature layers and set selection symbols
				// huc8
				this.huc8 = new FeatureLayer(this.obj.url + "/0", { mode: esri.layers.FeatureLayer.MODE_SELECTION, outFields: "*"});
				this.huc8_click = new FeatureLayer(this.obj.url + "/0", { mode: esri.layers.FeatureLayer.MODE_SELECTION, outFields: "*"});
				this.huc8.setSelectionSymbol(this.huc8highlightSymbol);
				// impaired watershed
				this.impWater = new FeatureLayer(this.obj.url + "/3", { mode: esri.layers.FeatureLayer.MODE_SELECTION, outFields: "*"});

				// huc 12 layer
				this.huc12 = new FeatureLayer(this.obj.url + "/1", { mode: esri.layers.FeatureLayer.MODE_SELECTION, outFields: "*"});
				
				//soils data
				var soilsUrl = this.obj.url + "/7";
				this.soils = new FeatureLayer(soilsUrl, { mode: esri.layers.FeatureLayer.MODE_SELECTION, outFields: "*"});
				this.soils.setSelectionSymbol(this.soilsSym);
				this.map.addLayer(this.soils);
				
				// bank data
				this.bank = new FeatureLayer(this.obj.url + "/5", { mode: esri.layers.FeatureLayer.MODE_SELECTION, outFields: "*"});
				this.bank.setSelectionSymbol(this.bankSym);
				// streams layer
				this.streams = new FeatureLayer(this.obj.url + "/6", { mode: esri.layers.FeatureLayer.MODE_SELECTION, outFields: "*"});
				this.streams.setSelectionSymbol(this.huc8highlightSymbol);
				// land cover data
				this.land = new FeatureLayer(this.obj.url + "/10000", { mode: esri.layers.FeatureLayer.MODE_SELECTION, outFields: "*"}); ;
				// sample points layer
				this.sampPoint = new FeatureLayer(this.obj.url + "/4", { mode: esri.layers.FeatureLayer.MODE_SELECTION, outFields: "*"});
				this.sampPoint.setRenderer(new SimpleRenderer(this.pntSym));
				//sampling stations layer
				this.samplingStations = new FeatureLayer(this.obj.url + "/2", { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, outFields: "*"});
				this.sSelected = 'map';

// MAP CLICKS/SELECTION COMPLETE //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

				// handle on click of map to query out attributes
				this.map.on("click", lang.hitch(this, function(evt) {
					this.mapClicks.mapClick(evt,this)
				}));
				// handle pointer on map pan and mouse up at the end of pan.
				this.map.on("mouse-up", lang.hitch (this, function(evt){
					if(this.obj.sel == 'tm' || this.obj.sel == 'sp'){
						this.map.setMapCursor('pointer');
					}
				}));
				this.map.on("mouse-over", lang.hitch (this, function(evt){
					if(this.obj.sel == 'tm' || this.obj.sel == 'sp'){
						this.map.setMapCursor('pointer');
					}
				}));
				// on selection complete of the huc8
				this.huc8.on("selection-complete", lang.hitch(this,function(f){
					this.mapClicks.huc8SelComplete(f,this);
				}));
				// build the secend huc 8 selection complete here
				// on selection complete of the huc8 click
				this.huc8_click.on("selection-complete", lang.hitch(this,function(f){
					this.mapClicks.huc8ClickSelComplete(f,this);
				}));
				// on selection complete of impaired watersheds
				this.impWater.on("selection-complete", lang.hitch(this,function(f){
					// call the impSelectionComplete function below.
					this.mapClicks.impSelectionComplete(f, this, lang);
				}));
// ADD FEATURES LAYERS ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
				//Add feature layers below for querying purposes
				this.map.addLayer(this.huc8); // add layer to map for querying purposes
				this.map.addLayer(this.huc8_click); // add layer to map for querying purposes
				this.map.addLayer(this.huc12); // add layer to map for querying purposes
				this.map.addLayer(this.impWater); // add layer to map for querying purposes

				//this.map.infoWindow.resize(245,125);
// GRAPH CLICKS SECTION //////////////////////////////////////////////////////////////////////////////////////////////
				// Handle clicks on the sampling stations which opens the graph
				this.samplingStations.on("click", lang.hitch(this,function(evt){
					this.obj.ssOID = evt.graphic.attributes.OBJECTID;
					this.obj.graphOpen = 'yes';
					this.graphClicks.samplingStationClick(evt,this);
				}));
				this.samplingStations.on('selection-complete', lang.hitch(this,function(f){
					var atts =  f.features[0];
					this.graphClicks.samplingStationSaveShare(atts,this);
					$('#'+ this.obj.traitBarSelected).trigger('click');
					$('#'+ this.obj.slTextSelected).trigger('click');
					if(this.obj.graphHideBtn == 'yes'){
						$('#' + this.id + 'graphHide').trigger('click');
					}
				}));

				// handle clicks on the graph show button
				$('#' + this.id + 'graphShow').on('click',lang.hitch(this,function(e){
					this.graphClicks.graphShow(e, this, lang);
				}));
				// handle clicks on the graph hide button
				$('#' + this.id + 'graphHide').on('click',lang.hitch(this,function(e){
					this.graphClicks.graphHide(e, this, lang);
				}));
				//trait bar chart clicks
				$('#' + this.id + 'traitBar').on('click',lang.hitch(this,function(e){
					this.graphClicks.traitBarClick(e, this, lang);
				}));
				// handle clicks on text below bar graph bars
				$('.slText').click(lang.hitch(this,function(e){
					this.graphClicks.slTextClick(e,this,lang);
				}));
				// handle click on graph bars
				$('.meanBars').click(lang.hitch(this,function(e){
					this.graphClicks.meanBarClicks(e, this, lang);
				}));
				// on hover return value of graph bar for UX. Did not use a function here as only 3 lines of code
				$('.meanBars').mouseover(lang.hitch(this,function(e){
					var numVal = $('#' + e.target.id).height()/100 * this.obj.rangeNum;
					numVal = numVal.toFixed(2);
					e.currentTarget.title = 'Value: ' + numVal;
				}));

// INTERNAL NAVIGATION ////////////////////////////////////////////////////////////////////////////////////////////////////
				// handle clicks on internal spatial button
				$('#' + this.id + 'spaBtn').on('click',lang.hitch(this,function(){
					this.navigation.internalSpatialClick(this);
				}));
				// handle clicks on internal temporal button
				$('#' + this.id + 'temBtn').on('click',lang.hitch(this,function(){
					this.navigation.internalTemporalClick(this);
				}));
				// clear button clicks
				$('#' + this.id + 'clearBtn').on('click',lang.hitch(this,function(){
					this.navigation.homeButtonClick(this);
				}));
				// clear impaired watersheds table
				$('#' + this.id + 'clearWaterBtn').on('click',lang.hitch(this,function(){
					this.navigation.impClear(this);
				}));
// EXTERNAL NAVIGATION ////////////////////////////////////////////////////////////////////////////////////////////////////////
				// Handle clicks on spatial button
				$('#' + this.id + 'spatial').on('click',lang.hitch(this,function(){
					this.navigation.spatialClick(this);
				}));
				// Handle clicks on temporal button
				$('#' + this.id + 'temporal').on('click',lang.hitch(this,function(){
					this.navigation.temporalClick(this);
				}));
				// handle clicks on Impaired watersheds button
				$('#' + this.id + 'impWaterButton').on('click',lang.hitch(this,function(){
					this.navigation.impWaterClick(this, lang);
				}));
				$('#' + this.id + 'learnMore').on('click',lang.hitch(this,function(){
					window.open("plugins\\water-quality\\images\\Water Quality Application Methods.pdf", "_blank");
				}));
				
				
				
// DYNAMIC MAP SERVICE  ////////////////////////////////////////////////
				// Add dynamic map service
				this.dynamicLayer = new ArcGISDynamicMapServiceLayer(this.obj.url, {opacity: 1 - this.obj.sliderVal/10});
				this.map.addLayer(this.dynamicLayer);
				this.extent = new Extent(this.obj.extent.xmin, this.obj.extent.ymin, this.obj.extent.xmax, this.obj.extent.ymax, new SpatialReference({ wkid:4326 }))
				this.dynamicLayer.on("load", lang.hitch(this, function () {
					if (this.obj.extent == ""){
						//this.map.setExtent(this.dynamicLayer.initialExtent, true);
					}else{
						this.extent = new Extent(this.obj.extent.xmin, this.obj.extent.ymin, this.obj.extent.xmax, this.obj.extent.ymax, new SpatialReference({ wkid:4326 }))
						this.map.setExtent(this.extent, true);
						this.obj.extent = "";
					}
					if (this.obj.visibleLayers.length > 0){
						this.dynamicLayer.setVisibleLayers(this.obj.visibleLayers);
						this.spid = this.obj.visibleLayers[0];
					}
					this.layersArray = this.dynamicLayer.layerInfos;

					// create supData array on load of app
					this.supDataArray = [];
					$.each(this.layersArray, lang.hitch(this,function(i,v){
						if(v.name.search('Soils') > -1 || v.name.search('Land Cover') > -1 || v.name.search('Streams') > -1 ||v.name.search('HUC12') > -1 || v.name.search('Banks') > -1){
							this.supDataArray.push(v.id)
						}
					}));
					
// Create sup data and trait object to see what sup data and trait data to show when huc8 is clicked ///////////////////////////////////////////////////
					
					this.supDataObject = {};
					this.huc12SupArray = [];
					// create query task on the huc 8 table at app startup

					var queryTask = new QueryTask(this.obj.url + "/1")
					var query = new Query();
					query.returnGeometry = false;
					query.outFields = ["huc8_abbr", "huc8_clean_names"];
					query.where = "OBJECTID > -1"
					queryTask.execute(query, lang.hitch(this, function(results){
						$.each(results.features,lang.hitch(this, function(i,v){
							this.huc12SupArray.push(v.attributes.huc8_abbr);
						}));
					}));

					this.huc12SupArray = unique(this.huc12SupArray);
					
// Set State Logic ///////////////////////////////////////////////////////////////////////////////////////////////////
					require(["jquery", "plugins/water-quality/js/chosen.jquery"],lang.hitch(this,function($) {
						if (this.obj.stateSet == 'yes'){
							this.saveState.saveStateFunc(this);
						}
					}));
				}));
// end of set state ////////////////////////////////////////////////////////////////////////////////////////////////

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
				if(this.tt == 'yes'){
					this.dialog = new TooltipDialog({
					  id: "tooltipDialog",
					  style: "position: absolute; width: 230px; font: normal normal normal 10pt Helvetica;z-index:100"
					});
					this.dialog.startup();
					this.tt = 'no';
				}
				// Enable jquery plugin 'chosen'
				require(["jquery", "plugins/water-quality/js/chosen.jquery"],lang.hitch(this,function($) {
					var configCrs =  { '.chosen-crs' : {allow_single_deselect:true, width:"200px", disable_search:false}}
					for (var selector in configCrs)  { $(selector).chosen(configCrs[selector]); }
				}));

// DROPDOWN MENUS //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
				// Use selections on chosen menus
				require(["jquery", "plugins/water-quality/js/chosen.jquery"],lang.hitch(this,function($) {
					//Select Huc8
					$('#' + this.id + 'ch-HUC8').chosen().change(lang.hitch(this,function(c, p){
						this.dropdown.huc8Select(c, p, this);
					}));
					// build the yearArray for the year select menu after change in traits menu
					$('#' + this.id + 'ch-traits').chosen().change(lang.hitch(this,function(c, d){
						this.dropdown.traitsSelect(c,d,this)
					}));
					$('#' + this.id + 'ch-years').chosen().change(lang.hitch(this,function(c, v){
						// if(this.obj.stateSet == 'yes'){
							// v = 'r';
						// }
						this.dropdown.yearsSelect(c,v,this);
						// v = undefined;
					}));
					// work with sample points checkbox
					this.map = this.map
					$('#' + this.id + 'ch-points').on('change',lang.hitch(this,function(c){
						this.map.graphics.clear();
						if (c.currentTarget.checked == true){
							var sampURL  = this.obj.url + '/4';
							this.sampPoint = new FeatureLayer(sampURL, { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, outFields: "*"}); 
							this.sampPoint.setDefinitionExpression("Watershed = '" + this.huc8Choosen + "'" + ' AND ' + "Year = '" + this.obj.year + "'" + ' AND ' + "Trait = '" + this.traitClean + "'");
							this.map.addLayer(this.sampPoint);
						}else{
							this.map.removeLayer(this.sampPoint);
							$('#' + this.id + 'sampleValue').slideUp();
						}
						this.sampPoint.on("click", lang.hitch(this,function(evt){
							this.sSelected = 'sp';
							this.map.graphics.clear();
							var sampleGraphic = new Graphic(evt.graphic.geometry,this.sampleSym);
							this.map.graphics.add(sampleGraphic);
							var val = evt.graphic.attributes.value_mean.toFixed(2)
							$('#' + this.id + 'sampleValue').show();
							var c = "<div style='padding:6px; font-size:16px;'><b>Station Value: </b>" + val + "</div>";
							$('#' + this.id + 'sampleValue').html(c);
							
						}));
					}));
					
					// when the infographic is opened during the use of the app use click below to determine the size the content pane should become
					 $('#' + this.id).parent().next().children('span').on('click', lang.hitch(this, function(){
						if(this.obj.sel == 'sp'){
							$(this.con).animate({ height: '565px', width: '350px' }, 250,
								lang.hitch(this,function(){
									this.resize();
								})
							);
						}
						if(this.obj.sel == 'tm'){
							$(this.con).animate({ height: '485px', width: '350px' }, 250,
								lang.hitch(this,function(){
									this.resize();
								})
							);
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
// SUPPORTING DATA /////////////////////////////////////////////////////////////////////////////////////////////////////////
				// work with sup radio buttons
				$('#' + this.id + 'supDataDiv input:radio').on('click', lang.hitch(this,function(c){
					this.supportingData.supRadioClick(this, c);
				}));

				this.rendered = true;
			}, // end of render function.


			// add huc8 and on huc8 load add click events
			addHuc8: function(){
				this.map.addLayer(this.huc8);
				var id =  this.id;
				this.huc8.on("click", lang.hitch(function(evt){
					var huc8ClickVal = evt.graphic.attributes.Abbr + '_' + evt.graphic.attributes.HUC_8
					$('#' + id + 'ch-HUC8').val(huc8ClickVal).trigger('chosen:updated').trigger('change');
				}));
			},
			// clear items function
			clearItems: function(){
				this.map.graphics.clear();
			},
		});
	});

// seperate functions from main body of script
function commaSeparateNumber(val){
    while (/(\d+)(\d{3})/.test(val.toString())){
		val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
	}
	return val;
}
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function unique(list){
	var result = [];
	$.each(list, function(i, e){
		if ($.inArray(e, result) == -1) result.push(e);
	});
	return result;
}

