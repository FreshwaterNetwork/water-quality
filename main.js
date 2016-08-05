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
			hasCustomPrint: true, usePrintPreviewMap: true, previewMapSize: [1000, 550], height:"200", width:"350",
			// Comment out the infoGraphic property below to make that annoying popup go away when you start the app
			//infoGraphic: "plugins/water-quality/images/infoGraphic.jpg",

// INITIALIZE FUNCTION /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// First function called when the user clicks the pluging icon.
			initialize: function (frameworkParameters) {
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
				//$('.legend').removeClass("hideLegend");
				this.map.__proto__._params.maxZoom = 23;
				if (this.appDiv != undefined){
					$('#' + this.id + 'ch-HUC8').val('').trigger('chosen:updated');
					$('#' + this.id + 'ch-HUC8').trigger('change');
				}
			},
// ACTIVATE FUNCTION /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
// START OF THE RENDER FUNCTION ////////////////////////////////////////////////////////////////////////////////////////////////////////
			render: function() {
// BRING IN OTHER JS FILES ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
				// set variables for all other js files
				this.graphClicks = new graphClicks();
				this.supportingData = new supportingData();
				this.navigation = new navigation();
				this.dropdown = new dropdown();
				this.mapClicks = new mapClicks();
				this.saveState = new saveState();

// ENABLE TABLESORTER FUNCTION /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
				// Enable jquery plugin 'tablesorter'
				require(["jquery", "plugins/water-quality/js/tablesorter"],lang.hitch(this,function($) {
					$("#" + this.id + "impTable").tablesorter({
						widthFixed : true,
						headerTemplate : '{content} {icon}', // Add icon for various themes

						widgets: [ 'zebra', 'stickyHeaders'],
						theme: 'blue',

						widgetOptions: {
							// jQuery selector or object to attach sticky header to
							//stickyHeaders_attachTo : '.impWaterWrapper',
							stickyHeaders_includeCaption: false // or $('.wrapper')
						}
					});
				}));
// ENABLE CHOOSEN FUNCTION /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
				// Enable jquery plugin 'chosen'
				require(["jquery", "plugins/water-quality/js/chosen.jquery"],lang.hitch(this,function($) {
					var configCrs =  { '.chosen-crs' : {allow_single_deselect:true, width:"200px", disable_search:false}}
					for (var selector in configCrs)  { $(selector).chosen(configCrs[selector]); }
				}));
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
				var huc8highlightSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
						new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
						new Color([0,46,115]), 3),
						new Color([236,239,222,0]));
// FEATURE LAYERS /////////////////////////////////////////////////////////////////////////////////////////////////////////
				// set all feature layers and set selection symbols
				// huc8
				this.huc8 = new FeatureLayer(this.obj.url + "/2", { mode: esri.layers.FeatureLayer.MODE_SELECTION, outFields: "*"});
				this.huc8_click = new FeatureLayer(this.obj.url + "/2", { mode: esri.layers.FeatureLayer.MODE_SELECTION, outFields: "*"});
				this.huc8.setSelectionSymbol(huc8highlightSymbol);
				// impaired watershed
				this.impWater = new FeatureLayer(this.obj.url + "/3", { mode: esri.layers.FeatureLayer.MODE_SELECTION, outFields: "*"});

				// huc 12 layer
				this.huc12 = new FeatureLayer(this.obj.url + "/1", { mode: esri.layers.FeatureLayer.MODE_SELECTION, outFields: "*"});
				// soils data
				this.soils = new FeatureLayer(this.obj.url + "/10000", { mode: esri.layers.FeatureLayer.MODE_SELECTION, outFields: "*"});
				this.soils.setSelectionSymbol(this.soilsSym);
				// land cover data
				this.land = new FeatureLayer(this.obj.url + "/10", { mode: esri.layers.FeatureLayer.MODE_SELECTION, outFields: "*"}); ;
				// sample points layer
				this.samplePoints = new FeatureLayer(this.obj.url + "/14", { mode: esri.layers.FeatureLayer.MODE_SNAPSHOT, outFields: "*"});
				this.samplePoints.setRenderer(new SimpleRenderer(this.pntSym));
				//sampling stations layer
				this.samplingStations = new FeatureLayer(this.obj.url + "/0", { mode: esri.layers.FeatureLayer.MODE_ONDEMAND, outFields: "*"});
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
					console.log('huc 8 click');
					this.mapClicks.huc8ClickSelComplete(f,this);
				}));
				// on selection complete for huc 12.
				this.huc12.on("selection-complete", lang.hitch(this,function(f){
					this.mapClicks.huc12SelComplete(f,this);
					this.obj.huc12ID = f.features[0].attributes.HUC_12;
					//this.supportingData.supDataFunction(f, this);
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
					//$('#' + this.id + 'traitBar').find('#'+ this.obj.temp).trigger('click');
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
// DYNAMIC MAP SERVICE  ////////////////////////////////////////////////
				// Add dynamic map service
				this.dynamicLayer = new ArcGISDynamicMapServiceLayer(this.obj.url, {opacity: 1 - this.obj.sliderVal/10});
				this.map.addLayer(this.dynamicLayer);
				this.dynamicLayer.on("load", lang.hitch(this, function () {
					if (this.obj.extent == ""){
						//this.map.setExtent(this.dynamicLayer.initialExtent, true);
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
					$('#' + this.id + 'ch-points').on('change',lang.hitch(this,function(v){
						this.dropdown.samplePointClick(v,this);
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
				
				// $('#' + this.id + 'cb-huc12').trigger("click");
				//$('#' + this.id + 'supDataDiv input:radio').val().trigger('click');
				
				
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

