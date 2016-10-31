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
			samplingStationClick: function(evt, t){
				var x = String(evt.target.attributes[10]);
				t.sSelected = 'ss';
				t.map.graphics.clear();
				t.spAtts = evt.graphic.attributes;
				if (t.spAtts.SITE_NAME == null){
					$('#' + t.id + 'chartHeader').text("Station ID: " + t.spAtts.Station_ID);
				}else{
					$('#' + t.id + 'chartHeader').text("Station ID: " + t.spAtts.SITE_NAME);
				}
				t.graphClicks.checkTraits(t.spAtts, t);
				var val = evt.target.attributes[0].ownerElement.r.animVal.valueAsString;
				if(val == "4"){

					var spHlGraphic = new Graphic(evt.graphic.geometry,t.hlStationPointS);
				}
				if(val == "6"){
					var spHlGraphic = new Graphic(evt.graphic.geometry,t.hlStationPointM);
				}
				if(val == "8"){
					var spHlGraphic = new Graphic(evt.graphic.geometry,t.hlStationPointL);
				}
				if(val == "10"){
					var spHlGraphic = new Graphic(evt.graphic.geometry,t.hlStationPointXL);
				}
				t.map.graphics.add(spHlGraphic);
				$('#' + t.id + 'graphShow, #' + t.id + 'showGraphText, #' + t.id + 'supData, #' + t.id + 'huc8Wrapper, #'  + t.id + 'bottomDiv').hide();
				$('#' + t.id + 'graphDiv').slideDown('slow');
				$(t.con).animate({ height: '520px', width: '630px' }, 250,
					lang.hitch(t,function(){
						t.resize();
						$('#' + t.id + 'graphHide' ).show();
					})
				);
			},
			samplingStationSaveShare: function(evt, t){
				t.sSelected = 'ss';
				t.map.graphics.clear();
				t.spAtts = evt.attributes;
				$('#' + t.id + 'chartHeader').text("Station ID " + t.spAtts.Station_ID);
				t.graphClicks.checkTraits(t.spAtts, t);

				var val = evt.target.attributes[0].ownerElement.r.animVal.valueAsString;
				if(val == "4"){

					var spHlGraphic = new Graphic(evt.graphic.geometry,t.hlStationPointS);
				}
				if(val == "6"){
					var spHlGraphic = new Graphic(evt.graphic.geometry,t.hlStationPointM);
				}
				if(val == "8"){
					var spHlGraphic = new Graphic(evt.graphic.geometry,t.hlStationPointL);
				}
				if(val == "10"){
					var spHlGraphic = new Graphic(evt.graphic.geometry,t.hlStationPointXL);
				}

				t.map.graphics.add(spHlGraphic);
				$('#' + t.id + 'graphShow, #' + t.id + 'showGraphText, #' + t.id + 'supData, #' + t.id + 'huc8Wrapper, #'  + t.id + 'bottomDiv').hide();
				$('#' + t.id + 'graphDiv').slideDown('slow');
				$(t.con).animate({ height: '520px', width: '630px' }, 250,
					lang.hitch(t,function(){
						t.resize();
						$('#' + t.id + 'graphHide' ).show();
					})
				);
			},

			graphShow: function(e, t, lang) {
				t.obj.graphHideBtn = 'no';
				$('#' + t.id + 'graphDiv').show();
				$('#' + t.id + 'graphShow').hide();
				$('#' + t.id + 'ch-HUC8, #' + t.id + 'supData, #' + t.id + 'huc8Wrapper, #' + t.id + 'bottomDiv').hide();
				$('#' + t.id + 'chartHeader').text("Station ID: " + t.spAtts.Station_ID);
				$(t.con).animate({ height: '520px', width: '630px' }, 250,
					lang.hitch(t,function(){
						t.resize();
						$('#' + t.id + 'graphHide').show();
					})
				);
			},
			graphHide: function(e, t, lang) {
				t.obj.graphHideBtn = 'yes';
				$('#' + t.id + 'chartHeader').text("Please choose or click on a HUC8");
				$('#' + t.id + 'graphDiv, #' + t.id + 'impWaterWrapper, #' + t.id + 'waterAttributes, #' + t.id + "graphHide").hide();
				// write an if statement to see if anything has been selected.
				if (t.obj.huc8Selected[0] == undefined || t.obj.huc8Selected[0] == ''){
				} else{
					$('#' + t.id + 'supData').slideDown();
				}
				$('#' + t.id + 'huc8Wrapper, #' + t.id + 'bottomDiv').show();
				$('#' + t.id + 'temporalWrapper').find('.graphToggle').toggle();
				if(t.obj.sel == 'tm'){
					$(t.con).animate({ height: '460px', width: '350px' }, 250,
						lang.hitch(t,function(){
							t.resize();
							$('#' + t.id + 'graphHide').hide();
						})
					);
				}
			},
			traitBarClick: function(e, t, lang) {
				var btnch = $('#' + t.id + 'traitBar').find('.buttonBar__button');
				$.each(btnch, function(i,v){
					$('#' + v.id).removeClass('buttonBar__selected')
				})
				t.obj.traitBarSelected = e.target.id
				$('#' + t.obj.traitBarSelected).addClass('buttonBar__selected');
				t.obj.tid = t.obj.traitBarSelected.split("-").pop();
				var val = t.obj.tid.slice(0,-4) + "value"
				
				var str  = t.spAtts[t.obj.tid]
				str = str.replace('[', '');
				str = str.replace('  ', '');
				str = str.replace(' ', '');
				str = str.replace(']', '');
				str = str.split(',');
				
				var l = [];
				$.each(str, lang.hitch(t, function(i,v){
					v = parseFloat(v); 
					l.push(v);
				}));
				//t.mean = JSON.parse(t.spAtts[t.obj.tid])
				t.mean = l;
				t.obj.val = JSON.parse(t.spAtts[val])
				t.obj.a = t.graphClicks.massageArray(t)
				t.graphClicks.updateChart(t, t.obj.a)
			},
			slTextClick: function(e, t, lang) {
				t.obj.slTextSelected = e.target.id;
				if ($(e.target).parent('.dis').length == 0){
					var c = $('#' + t.id + 'smLabelDiv').find('.slText')
					$.each(c, lang.hitch(t,function(i,v){
						$(v).parent('.smallLabels').removeClass('buttonBar__selected')
					}))
					$(e.target).parent('.smallLabels').addClass('buttonBar__selected')
					t.obj.year = $(e.target).html();
					t.graphClicks.updateLineChart(t);
					var c1 = $('#' + t.id + 'meanBarDiv').find('.meanBars')
					$.each(c1, lang.hitch(t,function(i, v) {
						if (v.id.substr(v.id.length - 4) == t.obj.year){
							$('#' + v.id).addClass('selBar')
						}else{
							$('#' + v.id).removeClass('selBar')
						}
					}));
				}
			},
			meanBarClicks: function(e, t, lang){
				if ($('#' + e.target.id).height() > 0){
					//add and remove classes
					var c = $('#' + t.id + 'meanBarDiv').find('.meanBars')
					$.each(c, function(i, v) {
						$('#' + v.id).removeClass('selBar')
					});
					$('#' + e.target.id).addClass('selBar');

					// get year
					var tid = e.target.id
					t.obj.year = tid.substr(tid.length - 4);
					t.graphClicks.updateLineChart(t)

					var c1 = $('#' + t.id + 'smLabelDiv').find('.slText')
					$.each(c1, lang.hitch(t,function(i,v){
						if ($(v).html() == t.obj.year){
							$(v).parent('.smallLabels').addClass('buttonBar__selected')
						}else{
							$(v).parent('.smallLabels').removeClass('buttonBar__selected')
						}
					}))
				}
			},
			checkTraits: function(atts, t){
				console.log(atts)
				var c = $('#' + t.id + 'meanBarDiv').find('.meanBars')
				$.each(c, function(i, v){
					$('#' + v.id).removeClass('selBar');
				});

				var ta = ["DOmean", "Nmean", "Pmean",
				"TDSmean", "TSSmean", "TURmean",
				"PHOmean", "IONmean", "AMMmean", "NITmean"]
				var taIn = []
				$.each(ta, lang.hitch(t,function(i,v){
					a = JSON.parse(atts[v])
					$.each(a, lang.hitch(t,function(j,w){
						if (w != -99){
							taIn.push(v)
							return false
						}
					}));
				}))
				var taOut = $(ta).not(taIn).get();
				t.obj.tid = ""
				$.each(taIn, lang.hitch(t,function(i,v){
					$('#' + t.id + '-' + v).prop('disabled', false);
					if (v == t.obj.trait + "mean"){
						t.obj.tid = v
					}
				}));
				$.each(taOut, lang.hitch(t,function(i,v){
					$('#' + t.id + '-' + v).prop('disabled', true);
				}));
				if (t.obj.tid == ""){
					t.obj.tid = taIn[0]
				}
				var val = t.obj.tid.slice(0,-4) + "value"
				t.mean = JSON.parse(t.spAtts[t.obj.tid])
				t.obj.val = JSON.parse(t.spAtts[val])
				var a = t.graphClicks.massageArray(t)
				t.graphClicks.updateChart(t, a)
				var btnch = $('#' + t.id + 'traitBar').find('.buttonBar__button');
				$.each(btnch, function(i,v){
					$('#' + v.id).removeClass('buttonBar__selected')
				})
				$('#' + t.id + "-" + t.obj.tid).addClass('buttonBar__selected');
			},
			massageArray: function(t){
				var a = []
				var num = 1
				t.obj.rangeNum = 0
				var lar = Math.max.apply(Math, t.mean);
				if (t.obj.tid == "DOmean"){
					num = 12
					t.obj.rangeNum = 12
					$('#' + t.id + 'hLbl').html('12mg/L')
					$('#' + t.id + 'mLbl').html('9mg/L')
					$('#' + t.id + 'lLbl').html('6mg/L')
					$('#' + t.id + 'uLbl').html('3mg/L')
				}
				if (t.obj.tid == "Nmean"){
					num = 6
					t.obj.rangeNum = 6
					$('#' + t.id + 'hLbl').html('6mg/L')
					$('#' + t.id + 'mLbl').html('4.5mg/L')
					$('#' + t.id + 'lLbl').html('3mg/L')
					$('#' + t.id + 'uLbl').html('1.5mg/L')
				}
				if (t.obj.tid == "Pmean"){
					num = 0.8
					t.obj.rangeNum = 0.8
					$('#' + t.id + 'hLbl').html('0.8mg/L')
					$('#' + t.id + 'mLbl').html('0.6mg/L')
					$('#' + t.id + 'lLbl').html('0.4mg/L')
					$('#' + t.id + 'uLbl').html('0.2mg/L')
				}
				if (t.obj.tid == "TDSmean"){
					num = 20000
					t.obj.rangeNum = 20000
					$('#' + t.id + 'hLbl').html('20,000mg/L')
					$('#' + t.id + 'mLbl').html('15,000mg/L')
					$('#' + t.id + 'lLbl').html('10,000mg/L')
					$('#' + t.id + 'uLbl').html('5,000mg/L')
				}
				if (t.obj.tid == "TSSmean"){
					num = 200
					t.obj.rangeNum = 200
					$('#' + t.id + 'hLbl').html('200mg/L')
					$('#' + t.id + 'mLbl').html('150mg/L')
					$('#' + t.id + 'lLbl').html('100mg/L')
					$('#' + t.id + 'uLbl').html('50mg/L')
				}
				if (t.obj.tid == "TURmean"){
					num = 500
					t.obj.rangeNum = 500
					$('#' + t.id + 'hLbl').html('500 NTU')
					$('#' + t.id + 'mLbl').html('375 NTU')
					$('#' + t.id + 'lLbl').html('250 NTU')
					$('#' + t.id + 'uLbl').html('125 NTU')
				}
				if (t.obj.tid == "PHOmean"){
					num = 200
					t.obj.rangeNum = 200
					$('#' + t.id + 'hLbl').html('1mg/L')
					$('#' + t.id + 'mLbl').html('.75mg/L')
					$('#' + t.id + 'lLbl').html('.50mg/L')
					$('#' + t.id + 'uLbl').html('.25mg/L')
				}
				if (t.obj.tid == "IONmean"){
					num = 6
					t.obj.rangeNum = 6
					$('#' + t.id + 'hLbl').html('6mg/L')
					$('#' + t.id + 'mLbl').html('4.5mg/L')
					$('#' + t.id + 'lLbl').html('3mg/L')
					$('#' + t.id + 'uLbl').html('1.5mg/L')
				}
				if (t.obj.tid == "AMMmean"){
					num = 3
					t.obj.rangeNum = 3
					$('#' + t.id + 'hLbl').html('3mg/L')
					$('#' + t.id + 'mLbl').html('2.25mg/L')
					$('#' + t.id + 'lLbl').html('1.5mg/L')
					$('#' + t.id + 'uLbl').html('.75mg/L')
				}
				if (t.obj.tid == "NITmean"){
					num = 2
					t.obj.rangeNum = 2
					$('#' + t.id + 'hLbl').html('2mg/L')
					$('#' + t.id + 'mLbl').html('1.5mg/L')
					$('#' + t.id + 'lLbl').html('1mg/L')
					$('#' + t.id + 'uLbl').html('.5mg/L')
				}
				$.each(t.mean, function(i, v) {
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

			updateChart: function(t,a){
				$('#' + t.id + 'mean1995').animate({ 'height': a[0] + '%'});
				$('#' + t.id + 'mean1996').animate({ 'height': a[1] + '%'});
				$('#' + t.id + 'mean1997').animate({ 'height': a[2] + '%'});
				$('#' + t.id + 'mean1998').animate({ 'height': a[3] + '%'});
				$('#' + t.id + 'mean1999').animate({ 'height': a[4] + '%'});
				$('#' + t.id + 'mean2000').animate({ 'height': a[5] + '%'});
				$('#' + t.id + 'mean2001').animate({ 'height': a[6] + '%'});
				$('#' + t.id + 'mean2002').animate({ 'height': a[7] + '%'});
				$('#' + t.id + 'mean2003').animate({ 'height': a[8] + '%'});
				$('#' + t.id + 'mean2004').animate({ 'height': a[9] + '%'});
				$('#' + t.id + 'mean2005').animate({ 'height': a[10] + '%'});
				$('#' + t.id + 'mean2006').animate({ 'height': a[11] + '%'});
				$('#' + t.id + 'mean2007').animate({ 'height': a[12] + '%'});
				$('#' + t.id + 'mean2008').animate({ 'height': a[13] + '%'});
				$('#' + t.id + 'mean2009').animate({ 'height': a[14] + '%'});
				$('#' + t.id + 'mean2010').animate({ 'height': a[15] + '%'});
				$('#' + t.id + 'mean2011').animate({ 'height': a[16] + '%'});
				$('#' + t.id + 'mean2012').animate({ 'height': a[17] + '%'});
				$('#' + t.id + 'mean2013').animate({ 'height': a[18] + '%'});
				$('#' + t.id + 'mean2014').animate({ 'height': a[19] + '%'}, 1000, "linear", lang.hitch(t,function() {
				t.graphClicks.checkSelectedBar(t);
				}));
			},
			checkSelectedBar: function(t){
				var c = $('#' + t.id + 'meanBarDiv').find('.meanBars')
				var keepYear = ""
				var outYears = []
				$.each(c, lang.hitch(t,function(i, v){
					if ($('#' + v.id).height() > 0){
						if (v.id.substr(v.id.length - 4) == t.obj.year){
							keepYear = t.obj.year
							$('#' + v.id).addClass('selBar');
						}
					}else{
						outYears.push(v.id.substr(v.id.length - 4))
					}
				}));
				var sl = $('#' + t.id + 'smLabelDiv').find('.slText')
				$.each(sl, lang.hitch(t,function(i,v){
					$(v).parent('.smallLabels').removeClass('dis')
					$(v).removeClass('disText')
				}));
				$.each(sl, lang.hitch(t,function(i,v){
					$.each(outYears, lang.hitch(t,function(j,w){
						if ($(v).html() == w){
							$(v).parent('.smallLabels').addClass('dis')
							$(v).addClass('disText')
						}
					}));
				}));
				if (keepYear != ""){
					t.obj.year = keepYear
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
					t.obj.year = yid.substr(yid.length - 4);
				}
				var c1 = $('#' + t.id + 'smLabelDiv').find('.slText')
				$.each(c1, lang.hitch(t,function(i, v){
					if ($(v).html() == t.obj.year){
						$(v).parent('.smallLabels').addClass('buttonBar__selected')
					}else{
						$(v).parent('.smallLabels').removeClass('buttonBar__selected')
					}
				}));

				t.graphClicks.updateLineChart(t)
			},

			updateLineChart: function(t){
				var d = []
				$.each(t.obj.val, lang.hitch(t,function(i,v){
					if (t.obj.year == v[0]){
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
				// this line is causing the problems in IE.
				new Chartist.Line('#' + t.id + 'lineChart', data, options);
				var units = "(mg/L)"
				if (t.obj.tid == "TURmean"){
					units = "(NTU)"
				}
				$('#' + t.id + 'lineChartTitle').html("Monthly Readings Taken in " + t.obj.year + " " + units)
			},

        });
    }
);