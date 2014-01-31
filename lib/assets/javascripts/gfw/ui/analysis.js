function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

jQuery.fn.smartPlaceholder = function(opt){

  this.each(function(){
    var
    speed   = (opt && opt.speed)   || 150,
    timeOut = (opt && opt.timeOut) || 100,
    $span   = $(this).find("span.holder"),
    $input  = $(this).find(":input").not("input[type='hidden'], input[type='submit']");

    if ($input.val()) {
      $span.hide();
    }

    $input.keydown(function(e) {

      if (e.metaKey && e.keyCode == 88) { // command+x
        setTimeout(function() {
          isEmpty($input.val()) && $span.fadeIn(speed);
        }, timeOut);
      } else if (e.metaKey && e.keyCode == 86) { // command+v
        setTimeout(function() {
          !isEmpty($input.val()) && $span.fadeOut(speed);
        }, timeOut);
      } else {
        setTimeout(function() { ($input.val()) ?  $span.fadeOut(speed) : $span.fadeIn(speed); }, 0);
      }
    });

    $span.click(function() { $input.focus(); });
    $input.blur(function() { !$input.val() && $span.fadeIn(speed); });
  });
}

gfw.ui.model.AnalysisReset = cdb.core.Model.extend({ });

gfw.ui.view.AnalysisReset = cdb.core.View.extend({
  className: 'analysis_reset',

  events: {
    'click a.delete' : '_onClickDelete',
    'click a.cancel' : '_onClickCancel'
  },

  initialize: function() {
    this.model = new gfw.ui.model.AnalysisReset({ });

    this.model.bind("change:toggleReset", this._toggleReset, this);

    var template = $("#analysis_reset-template").html();

    this.template = new cdb.core.Template({
      template: template,
      type: 'mustache'
    });
  },

  render: function() {
    this.$el.html(this.template.render( this.model.toJSON() ));

    return this.$el;
  },

  _toggleReset: function() {
    if(this.model.get("toggleReset")) {
      this.$el.fadeIn(250);
    } else {
      this.$el.fadeOut(250);
    }
  },

  show: function() {
    this.model.set("toggleReset", true);
  },

  hide: function() {
    this.model.set("toggleReset", false);
  },

  _onClickDelete: function(e) {
    e.preventDefault();

    Analysis._clearAnalysis();
    Analysis.info.hide();

    this.hide();
  },

  _onClickCancel: function(e) {
    e.preventDefault();

    this.hide();
  }
});

gfw.ui.model.AnalysisButton = Backbone.Model.extend({
  show: false
});

gfw.ui.view.AnalysisButton = Backbone.View.extend({
  className: 'analysis_control',

  events: {
    'click a#analysis_control': '_onClickButton'
  },

  initialize: function() {
    this.model.bind("change:toggleButton",  this._toggleButton, this);
    this.model.bind("change:show", this._toggle, this);

    var template = $("#analysis_control-template").html();

    this.template = new cdb.core.Template({
      template: template,
      type: 'mustache'
    });
  },

  // Button
  _toggleButton: function() {
    if (this.model.get("toggleButton")) {
      this.model.set({"disabled": false});
    } else {
      this.model.set({"disabled": true});
    }

    this._toggleDisabled();
  },

  hide: function() {
    this.model.set("show", false);
  },

  show: function() {
    this.model.set("show", true);
  },

  _toggle: function() {
    if (this.model.get("show")) {
      this.$el.find("#analysis_control").fadeIn(250);
    } else {
      this.$el.find("#analysis_control").fadeOut(250);
    }
  },

  _enableButton: function() {
    this.model.set("toggleButton", true);
  },

  _disableButton: function() {
    this.model.set("toggleButton", false);
  },

  _isDisabled: function() {
    return this.model.get("disabled");
  },

  _onClickButton: function(e) {
    e.preventDefault();

    if (!this._isDisabled()) {
      Analysis.startAnalyzing();
    }
  },

  _toggleDisabled: function() {
    if(this._isDisabled()) {
      this.$button.addClass("disabled");
      $(this.$button).tipsy('disable');
      $('.tipsy').remove();
    } else {
      this.$button.removeClass("disabled");
      $(this.$button).tipsy('enable');
    }
  },

  render: function() {
    this.$el.html(this.template.render( this.model.toJSON() ));

    this.$button = this.$("#analysis_control");

    $(this.$button).tipsy({ title: 'data-tip', fade: true, gravity: 'w' });

    return this.$el;
  }
});

gfw.ui.model.AnalysisInfo = Backbone.Model.extend({
  defaults: {
    umd: false
  }
});

gfw.ui.view.AnalysisInfo = gfw.ui.view.Widget.extend({
  className: 'analysis_info',

  events: {
    'click .download':    '_onDownloadClick',
    'click .toggle':      '_toggleOpen',
    'click a.reset':      '_onClickReset',
    'click a.subscribe':  '_onClickSubscribe'
  },

  defaults: {
    speed: 250,
    minHeight: 15
  },

  initialize: function() {
    _.bindAll( this, "toggleDraggable", "onStopDragging", "_onClickSubscribe", "_updateSubtitle", "_toggleOpen", "open", "close");

    this.model.set("dataset", "umd");

    this.model.bind("change:draggable",   this.toggleDraggable);
    this.model.bind("change:show",        this._toggle,    this);
    this.model.bind("change:ha",          this._changeHA,  this);
    this.model.bind("change:title",       this._updateTitle, this);
    this.model.bind("change:alert_count", this._updateAlertCount, this);
    this.model.bind("change:subtitle",    this._updateSubtitle);
    this.model.bind("change:dataset",     this._updateDataset, this);

    this.model.bind("change:loss",             this.render, this);
    this.model.bind("change:treecover_2000",   this.render, this);
    this.model.bind("change:gain",             this.render, this);

    this.model.set("containment", "#map-container .map");

    var template = $("#analysis-info-template").html();

    this.subscribe = new gfw.ui.view.AnalysisSubscribe();
    $("body").append(this.subscribe.render());

    this.reset = new gfw.ui.view.AnalysisReset();
    $("body").append(this.reset.render());

    this.template = new cdb.core.Template({
      template: template,
      type: 'mustache'
    });

    this.url = 'http://wip.gfw-apis.appspot.com/datasets/';
    this.dataset = 'umd';
    this.iso = config.ISO;

    // Subscribe to timeline change_date event to update alerts URL:
    subscribe('timeline:change_date', _.bind(function(y0, m0, y1, m1) {
      var start = '';
      var end = '';
      var dataset = ''
      var iso = this.iso;

      if (GFW.app.currentBaseLayer == "loss") {
        dataset = 'umd';
      } else if(GFW.app.currentBaseLayer == "semi_monthly") {
        dataset = 'forma';
      } else if(GFW.app.currentBaseLayer == "quarterly") {
        dataset = 'modis';
      } else if(GFW.app.currentBaseLayer == "brazilian_amazon") {
        dataset = 'imazon';
      }

      // Convert months to (1-12):
      m0 = ((m0 - 71) % 12) + 1;
      m1 = ((m1 - 71) % 12) + 1;

      // Create dates, 0 padding months < 10:
      start = y0 + '-' + ((m0 < 10) ? ("0" + m0) : m0) + '-01';
      end = y1 + '-' + ((m1 < 10) ? ("0" + m1) : m1) + '-01';

      this.start = start;

      this.end = end;

      this.dataset = dataset;

      this.dates = [y0, m0, y1, m1];

      if((this.dates[1] >= 1 && this.dates[1] <= 12) && (this.dates[3] >= 1 && this.dates[3] <= 12) && !Timeline.playing) {
        this.model.set({'subtitle': this.dates[0]+", "+config.MONTHNAMES_SHORT[this.dates[1]-1].charAt(0).toUpperCase() + config.MONTHNAMES_SHORT[this.dates[1]-1].slice(1).toLowerCase()+" to "+this.dates[2]+", "+config.MONTHNAMES_SHORT[this.dates[3]-1].charAt(0).toUpperCase() + config.MONTHNAMES_SHORT[this.dates[3]-1].slice(1).toLowerCase()});

        this.model.set('beginAt', start);
        this.model.set('endAt', end);
        this.model.set('iso', iso);

      }
    }, this));

    subscribe('timeline:change_modis_date', _.bind(function(month, year) {
      var dataset = 'modis';
      var iso = this.iso;

      var year_ = parseInt(year, 10),
          month_ = parseInt(month, 10);

      var date = year_+"-"+month_+"-"+"15";

      this.date = date;

      var q1 = config.MONTHNAMES_SHORT[(month_-3 >= 0) ? month_-3 : month_+9].charAt(0).toUpperCase() + config.MONTHNAMES_SHORT[(month_-3 >= 0) ? month_-3 : month_+9].slice(1).toLowerCase()
      var q2 = config.MONTHNAMES_SHORT[(month_-1 >= 0) ? month_-1 : month_+11].charAt(0).toUpperCase() + config.MONTHNAMES_SHORT[(month_-1 >= 0) ? month_-1 : month_+11].slice(1).toLowerCase()
      this.dataset = dataset;

      this.model.set({'subtitle': year_+", "+q1+" to "+year_+", "+q2});

      this.model.set('date', date);
      this.model.set('iso', iso);

      this._getAlertCount();
    }, this));

    // Fire off API request for FORMA alert count for current timeline dates:
    subscribe('timeline:onStopDragging', _.bind(function() {
      this._getAlertCount();
    }, this));
  },

  _updateSubtitle: function() {
    if(this.$el.length > 0) {
      $(this.$subtitle).html(this.model.get("subtitle"));
    }
  },

  _updateDataset: function() {
    this.dataset = this.model.get("dataset");

    if (this.dataset === 'umd') {
      this.$dataset.html("Total UMD tree cover alerts");
    } else {
      this.$dataset.html("Total "+this.dataset+" alerts");
    }

    this._getAlertCount();
  },

  // Gets FORMA alert count via API:
  _getAlertCount: function() {
    var that = this;

    if (!this.initStats) return;

      var polytype = this.model.get("area");

      var range;

      if (this.dataset == 'modis') {
        range = "&date="+this.date;
      } else {
        range = "&begin="+this.start+"&end="+this.end;
      }
      if (this.dataset == 'umd') {
        if (this.iso === 'ALL' || this.protectedArea) {
          this.alertsUrl = this.url+"hansen?layer=sum&geom="+encodeURI(polytype);
          this.downloadUrl = this.url+"hansen.shp?layer=sum&geom="+encodeURI(polytype);
        } else {
          this.alertsUrl = this.url+"hansen?layer=sum&iso="+this.iso;
          this.downloadUrl = this.url+"hansen.shp?layer=sum&iso="+this.iso;
        }
      } else if (this.dataset == 'modis') {
        if (this.iso === 'ALL' || this.protectedArea) {
          this.alertsUrl = this.url+"modis?geom="+encodeURI(polytype)+range;
          this.downloadUrl = this.url+"modis.shp?geom="+encodeURI(polytype)+range;
        } else {
          this.alertsUrl = this.url+"modis?iso="+this.iso+range;
          this.downloadUrl = this.url+"modis.shp?iso="+this.iso+range;
        }
      } else {
        if (this.iso === 'ALL' || this.protectedArea) {
          this.alertsUrl = this.url+this.model.get('dataset')+"?geom="+encodeURI(polytype)+range;
          this.downloadUrl = this.url+this.model.get('dataset')+".shp?geom="+encodeURI(polytype)+range;
        } else {
          this.alertsUrl = this.url+this.model.get('dataset')+"?iso="+this.iso+range;
          this.downloadUrl = this.url+this.model.get('dataset')+".shp?iso="+this.iso+range;
        }
      }

    // Hook up the FORMA download URL (zipped up Shapefile):
    this.$('a.download').attr('href', this.downloadUrl);

    this.model.set({ 'alert_count': 'Analyzing... ' });

    this.$el.find(".stats .error").fadeOut(150);

    this.$el.find(".stats .title, .stats ul").fadeOut(250, function() {
      that.$el.find(".stats .spinner").fadeIn(250);
    });

    executeAjax(
      this.alertsUrl,
      {},
      {
        success: _.bind(function(data) {
          var showAlerts = false;

          if (this.dataset == 'modis' && data && data.total) {
            var unit = ' alerts';
            this.model.set({'alert_count': Analysis._formatNumber((data.total), true) + unit});
            showAlerts = true;
          } else if (this.dataset == 'umd' && data) {
            var unit = " meters";

            var loss      = Analysis._formatNumber((data.area.loss_sum).toFixed(2), true) + unit;
            var treeCover = Analysis._formatNumber((data.area.treecover_2000).toFixed(2), true) + unit;
            var gain      = Analysis._formatNumber((data.area.gain).toFixed(2), true) + unit;

            this.model.set({ 'loss': loss, 'treecover_2000': treeCover, 'gain': gain });

          } else if (this.dataset != "umd" && data && data.value) {
            var unit = (this.model.get("dataset") === 'imazon') ? ' '+data.units : ' alerts';
            this.model.set({'alert_count': Analysis._formatNumber((data.value).toFixed(2), true) + unit});
            showAlerts = true;
          } else {
            this.model.set({'alert_count': 'No alerts'});
            showAlerts = false;
          }

          this.render();

          if (showAlerts) {
            Analysis.info.$el.find(".download").fadeIn(150);
          } else {
            Analysis.info.$el.find(".download").hide();
          }

          this.$el.find(".stats .error").fadeOut(150);

          this.$el.find(".stats .spinner").fadeOut(250, function() {
            that.$el.find(".stats .title, .stats ul").fadeIn(250);
          });

        }, this),

        error: _.bind(function(error) {

          this.$el.find(".stats .title, .stats ul, .stats .spinner").fadeOut(150, function() {
            that.$el.find(".error").fadeIn(250);
          });

        }, this)
      });
  },

  _onDownloadClick: function(e) {
    e.stopPropagation();
    e.preventDefault();
  },

  // Helper
  _changeHA: function() {

    var ha = this.model.get("ha");

    this.$el.find(".ha .count strong").html(ha);
  },

  _toggle: function() {
    if (this.model.get("show")) this.render().fadeIn(250);
    else this.$el.fadeOut(250);
  },

  _onClickReset: function(e) {
    var pos = this.$el.find("a.reset").offset();

    this.reset.$el.css({
      top: pos.top,
      left: pos.left
    });

    e.preventDefault();
    this.reset.show();
  },

  _onClickSubscribe: function(e) {
    e.preventDefault();
    e.stopPropagation();

    this.subscribe.show();
  },

  show: function() {
    this.model.set("show", true);
  },

  hide: function() {
    this.model.set("show", false);
    this.initStats = false;
  },

  _updateTitle: function() {
    this.$title.html(this.model.get("title"));
    this.$info_title.html(this.model.get("title"));
  },

  _updateAlertCount: function() {
    this.$alert_count.html(this.model.get("alert_count"));
  },

  open: function() {
    var that = this;

    this.model.set("closed", false);

    this.$info_title.fadeOut(250, function() {
      that.$content.animate({ opacity: 1, height: "263px"}, that.defaults.speed);
      that.$shadow.fadeIn(250);
    });

    this.$el.removeClass("closed");

  },

  close: function() {
    var that = this;
    this.model.set("closed", true);

    this.$content.css('overflow', 'hidden');
    this.$content.animate({
      opacity: 0,
      height: '15px',
      padding: 0
    }, this.defaults.speed, function() {
      that.$info_title.fadeIn(250);
      that.$shadow.fadeOut(250);
    });

    this.$el.addClass("closed");
  },

  render: function() {
    var that = this;

    var options = _.extend(this.model.toJSON(), { umd: this.model.get("dataset") == 'umd' });
    this.$el.html(this.template.render( options ));

    this.$content     = this.$el.find(".content");
    this.$info_title  = this.$el.find(".info_title");
    this.$title       = this.$el.find(".info .titles .title");
    this.$dataset     = this.$el.find(".alert .title");
    this.$shadow      = this.$el.find(".shadow");
    this.$alert_count = this.$el.find("#alerts-count");
    this.$subtitle    = this.$el.find(".subtitle");

    this.downloadDropdown = new gfw.ui.view.DownloadDropdown({
      model: this.model,
      downloadEl: this.$el.find(".download")
    });

    this.$el.append(this.downloadDropdown.render());

    return this.$el;
  }
});

gfw.ui.view.DownloadDropdown = cdb.core.View.extend({

  className: 'analysis_dropdown hidden',

  initialize: function() {

    var template = $("#analysis-dropdown-template").html();

    this.template = new cdb.core.Template({
      template: template,
      type: 'mustache'
    });

    this.model = this.options.model;
    this.model.bind("change:dataset", this.render, this);
    this.model.bind("change:beginAt", this.render, this);
    this.model.bind("change:endAt", this.render, this);
  },

  _generateURL: function(format) {

    var dataset = this.model.get("dataset");
    var area    = this.model.get("area");
    var beginAt = this.model.get("beginAt");
    var endAt   = this.model.get("endAt");

    // TODO: implement the rest of the layers
    if (dataset === 'protected') {
      return 'protected';
    } else if (dataset === 'umd') {
      return 'http://wip.gfw-apis.appspot.com/datasets/hansen?layer=sum&geom=' + encodeURI(area);
    } else {
      return '//wip.gfw-apis.appspot.com/datasets/' + dataset + '.' + format + '?begin=' + beginAt + '&end=' + endAt + '&geom=' + encodeURI(area);
    }

  },

  render: function() {
    var options = {
      urls: [
        { name: "SVG",     url: this._generateURL('svg') },
        { name: "GeoJSON", url: this._generateURL('geojson') },
        { name: "SHP",     url: this._generateURL('shp') },
        { name: "KML",     url: this._generateURL('kml') },
        { name: "CSV",     url: this._generateURL('csv') }
      ]
    };

    this.$el.html(this.template.render( options ));

    var $el = this.$el;

    $(".download").qtip({
      show: 'click',
      hide: {
        event: 'click unfocus'
      },
      content: {
        text: $el
      },
      position: {
        my: 'top right',
        at: 'bottom right',
        target: $('.download'),
        adjust: {
          x: 10
        }
      },
      style: {
        tip: {
          corner: 'top right',
          mimic: 'top center',
          border: 1,
          width: 10,
          height: 6
        }
      }
    });

    return this.$el;
  }

});

gfw.ui.model.Analysis = cdb.core.Model.extend({ });

gfw.ui.view.Analysis = cdb.core.View.extend({
  className: 'analysis',

  events: {
    'click a.done'    : '_onClickDone',
    'click a.cancel'  : '_onClickCancel',
    'click a.reset'   : '_onClickDone'
  },

  initialize: function() {
    _.bindAll(this, "_onOverlayComplete", "_clearSelection", "_clearAnalysis", "_onClickCancel");

    this.analyzing = false;
    this.protectedArea = false;

    this.selectedShapes = [];
    this.selectedShape;

    this.model = new gfw.ui.model.Analysis({});

    this.model.bind("change:toggleDoneButton",  this._toggleDoneButton, this);
    this.model.bind("change:toggleHelper",      this._toggleHelper, this);

    this.countries = {CHN:"China", MYS:"Malaysia", VEN:"Venezuela", VNM:"Vietnam", MMR:"Myanmar", BRA:"Brazil", PAN:"Panama", PNG:"Papua New Guinea", ACI:"Ashmore and Cartier Is.", AUS:"Australia", MTQ:"Martinique", IND:"India", BGD:"Bangladesh", BRN:"Brunei", GUF:"French Guiana", LAO:"Laos", THA:"Thailand", IDN:"Indonesia", MEX:"Mexico", JPN:"Japan", PHL:"Philippines", KHM:"Cambodia", TWN:"Taiwan", KEN:"Kenya", MDG:"Madagascar", TZA:"Tanzania", UGA:"Uganda", AGO:"Angola", PRY:"Paraguay", COL:"Colombia", ARG:"Argentina", CMR:"Cameroon", CAF:"Central African Republic", BOL:"Bolivia", LKA:"Sri Lanka", ECU:"Ecuador", SLE:"Sierra Leone", CRI:"Costa Rica", GUY:"Guyana", NPL:"Nepal", GIN:"Guinea", PER:"Peru", HTI:"Haiti", HND:"Honduras", LBR:"Liberia", NGA:"Nigeria", CIV:"Ivory Coast", SSD:"South Sudan", SUR:"Suriname", COD:"Democratic Republic Of The Congo", COG:"Republic Of Congo", RWA:"Rwanda", BTN:"Bhutan", BEN:"Benin", SDN:"Sudan", BDI:"Burundi", GTM:"Guatemala", NIC:"Nicaragua", GHA:"Ghana", GAB:"Gabon", TGO:"Togo", SLV:"El Salvador" }

    var template = $("#analysis-template").html();

    this.template = new cdb.core.Template({
      template: template,
      type: 'mustache'
    });

  },

  startAnalyzing: function() {
    this._clearAnalysis();
    this.info.hide();
    this.button._disableButton();
    this._showHelper();
    this._setupDrawingManager();
    this.analyzing = true;

    GFW.app._hideStoriesMarkers();

    if (Timeline && Timeline.hide) Timeline.hide();
    if (TimelineLoss && TimelineLoss.hide) TimelineLoss.hide();

    if(GFW.app.mongabayLoaded) {
      GFW.app._hideMongabayLayer();
      GFW.app.mongabayHidden = true;
    }
  },

  _loadCountry: function(ISO) {
    if (Timeline && Timeline.hide) Timeline.hide();
    if (typeof TimelineLoss !== 'undefined' && TimelineLoss.hide) TimelineLoss.hide();
    //legend.close();

    this.info.show();
    this.info.model.set("title", this.countries[ISO] || ISO);

    this._clearSelection();
    this._deleteSelectedShape();
    this._loadCountryGeoJSON(ISO);
  },

  _loadProtectedArea: function(id, title) {

    Timeline.hide();
    TimelineLoss.hide();
    Legend.close();

    this.info.show();
    this.info.model.set("title", title);

    this._clearSelection();
    this._deleteSelectedShape();
    this._loadProtectedAreaGeoJSON(id);
  },

  _loadProtectedAreaGeoJSON: function(id) {

    var that = this;
    var query = "http://www.protectedplanet.net/sites/"+id+"/protected_areas/geom?simplification=0";

    this.info.protectedArea = true;

    $.ajax({
      url: query,
      dataType: 'jsonp',
      success: function(response) {
        that._loadPolygon(response.the_geom);
      }
    });

  },

  _loadPolygon: function(the_geom, area) {

    var that = this;

    var style = {
        strokeWeight: 2,
        fillOpacity: 0.25,
        fillOpacity: 0.45,
        fillColor: "#FFF",
        strokeColor: "#A2BC28",
        editable: true
      };

    style.editable = false;

    var features = new GeoJSON(the_geom, style);

    for (var i in features) {
      if (features[i].length > 0) {
        for (var j in features[i]) {
          var feature = features[i][j];
          feature.setMap(map);
          this.selectedShapes.push(feature);
        }
      } else {
        var feature = features[i];
        feature.setMap(map);
        this.selectedShapes.push(feature);
      }

    }

    var polygon_ = the_geom;
        ha = null;

    if (area) { // from country
      polygon_ = the_geom.features[0]['geometry'];
      // ha = area;
      ha = that._calcAreaMultiPolygon(polygon_);
    } else {
      ha = that._calcAreaPolygon(polygon_);
    }

    Analysis.info.model.set("area", JSON.stringify(polygon_));

    Analysis.info.model.set("ha", ha);

    this._fitBounds();

    if(!this.info.initStats) this.info.initStats = true;

    this.info._getAlertCount();
  },

  _fitBounds: function() {
    var bounds = new google.maps.LatLngBounds();
    var features = this.selectedShapes;

    for (var i in features) {
      if (features[i].length > 0) {
        for (var j in features[i]) {
          var feature = features[i][j];
          feature.setMap(map);
          this.selectedShapes.push(feature);
        }
      } else {
        var feature = features[i];
        feature.setMap(map);
        this.selectedShapes.push(feature);
      }

      var points = feature.latLngs.getArray()[0].getArray();

      // Extend bounds
      for (var z = 0; z < points.length; z++) {
        lat = points[z].lat();
        lng = points[z].lng();
        point = new google.maps.LatLng(lat, lng);
        bounds.extend(point);
      }

    }

    map.fitBounds(bounds);

  },

  _loadCountryGeoJSON: function(ISO) {

    var that = this;
    var query = "https://wri-01.cartodb.com/api/v2/sql?q=SELECT the_geom, st_area(the_geom::geography) as area FROM ne_50m_admin_0_countries WHERE iso_a3 ='" + ISO + "'&format=geojson";

    $.ajax({
      url: query,
      dataType: 'jsonp',
      success: function(the_geom) {
        that._loadPolygon(the_geom, '999');
      }
    });

  },

  _setupDrawingManager: function() {
    var self = this;

    var options = {
      drawingModes: [ google.maps.drawing.OverlayType.POLYGON ],
      drawingControl: false,
      markerOptions: {
        draggable: false,
        icon: new google.maps.MarkerImage(
          '/assets/icons/marker_exclamation.png',
          new google.maps.Size(45, 45), // desired size
          new google.maps.Point(0, 0),  // offset within the scaled sprite
          new google.maps.Point(20, 20) // anchor point is half of the desired size
        )
      },

      drawingControlOptions: {
        position: google.maps.ControlPosition.RIGHT_TOP,
        drawingModes: [google.maps.drawing.OverlayType.POLYGON, google.maps.drawing.OverlayType.MARKER]
      },

      polygonOptions: {
        strokeWeight: 2,
        fillOpacity: 0.25,
        fillOpacity: 0.45,
        fillColor: "#FFF",
        strokeColor: "#A2BC28",
        editable: true
      },
      panControl: false,
      map: map
    };

    // Create the drawing manager
    this.drawingManager = new google.maps.drawing.DrawingManager(options);

    // Start drawing right away
    this.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);

    // Event binding
    google.maps.event.addListener(this.drawingManager, 'overlaycomplete', this._onOverlayComplete);
  },

  /*
  * Adds thousands separators.
  **/
  _formatNumber:function(x, abs) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    var number = parts.join(".");

    if (abs) if (number) number = number.replace("-", ""); // abs
    return number;

  },

  _onOverlayComplete: function(e) {
    var polygon = {};
    var c0 = [];
    var area = null;

    this.drawingManager.setDrawingMode(null);
    this.drawingManager.path = e.overlay.getPath().getArray();
    this.drawingManager.setOptions({ drawingControl: false });
    this._enableDoneButton();

    var newShape = e.overlay;
    newShape.type = e.type;

    this._setSelection(newShape);

    polygon = {
      "type": "Polygon",
      "coordinates": [

          $.map(this.drawingManager.path, function(latlong, index) {
            return [[latlong.lng(), latlong.lat()]];
          })

      ]
    };

    // Close the polygon:
    c0 = polygon.coordinates[0][0];
    polygon.coordinates[0].push(c0);

    area = this._calcAreaPolygon(polygon);

    Analysis.info.model.set("area", JSON.stringify(polygon));

    Analysis.info.model.set("ha", area);
  },

  _calcAreaMultiPolygon: function(polygon) {
    // https://github.com/maxogden/geojson-js-utils
    var area = 0;
    var points = polygon.coordinates[0][0];
    var j = points.length - 1;
    var p1, p2;

    for (var i = 0; i < points.length; j = i++) {
      var p1 = {
        x: points[i][1],
        y: points[i][0]
      };
      var p2 = {
        x: points[j][1],
        y: points[j][0]
      };
      area += p1.x * p2.y;
      area -= p1.y * p2.x;
    }

    area /= 2;

    return this._formatNumber((area*1000000).toFixed(2), true);

  },

  _calcAreaPolygon: function(polygon) {
    // https://github.com/maxogden/geojson-js-utils
    var area = 0;
    var points = polygon.coordinates[0];
    var j = points.length - 1;
    var p1, p2;

    for (var i = 0; i < points.length; j = i++) {
      var p1 = {
        x: points[i][1],
        y: points[i][0]
      };
      var p2 = {
        x: points[j][1],
        y: points[j][0]
      };
      area += p1.x * p2.y;
      area -= p1.y * p2.x;
    }

    area /= 2;

    return this._formatNumber((area*1000000).toFixed(2), true);

  },

  _clearSelection: function() {

    if (this.selectedShapes.length > 0) {

      for (var i in this.selectedShapes) {
        if (this.selectedShapes[i]) {
          this.selectedShapes[i].setEditable(true);
          this.selectedShapes[i].setMap(null);
        }
      }

      this.selectedShapes = [];
      if (this.drawingManager && this.drawingManager.path) this.drawingManager.path = null;
    }
  },

  _deleteSelectedShape: function() {
    if (this.selectedShape) {
      this.selectedShape.setMap(null);
      this.selectedShape = null;
    }
  },

  _setSelection: function(shape) {
    this._clearSelection();
    this.selectedShape = shape;
  },

  _clearAnalysis: function() {
    if (this.protectedArea) this.protectedArea = false;

    this._updateHash("ALL");
    this._clearSelection();
    this._deleteSelectedShape();

    if (this.drawingManager) {
      this.drawingManager.setDrawingMode(null);
      this.drawingManager.setOptions({ drawingControl: false });
      this.drawingManager.path = null;
    }

    this.button._enableButton();
  },

  _updateHash: function(iso) {
    var
    hash,
    zoom = map.getZoom(),
    lat  = map.getCenter().lat().toFixed(GFW.app._precision),
    lng  = map.getCenter().lng().toFixed(GFW.app._precision);

    config.ISO = iso;

    var layers = config.MAPOPTIONS.layers;

    if (layers) {
      hash = "map/" + zoom + "/" + lat + "/" + lng + "/" + config.ISO + "/" + layers;
    } else {
      hash = "map/" + zoom + "/" + lat + "/" + lng + "/" + config.ISO + "/";
    }

    window.router.navigate(hash);

  },

  _onClickCancel: function(e) {
    e.preventDefault();

    this.info.initStats = false;
    Analysis.analyzing = false;

    this._clearAnalysis();
    this._deleteSelectedShape();
    this._hideHelper();

    GFW.app._showStoriesMarkers();

    if(GFW.app.mongabayHidden) {
      GFW.app._loadMongabayLayer();
      GFW.app.mongabayHidden = false;
    }
  },

  // Done button
  _toggleDoneButton: function() {
    if (this.model.get("toggleDoneButton")) {
      this.$doneButton.removeClass("disabled");
    } else {
      this.$doneButton.addClass("disabled");
    }
  },

  _enableDoneButton: function() {
    this.model.set("toggleDoneButton", true);
  },

  _disableDoneButton: function() {
    this.model.set("toggleDoneButton", false);
  },

  _onClickDone: function(e) {
    e.preventDefault();

    this._done();
  },

  _done: function() {
    Analysis.analyzing = false;
    this._hideHelper();

    if(!this.info.initStats) this.info.initStats = true;

    this.info._getAlertCount();
    this.info.show();

    GFW.app._showStoriesMarkers();

    if(GFW.app.mongabayHidden) {
      GFW.app._loadMongabayLayer();
      GFW.app.mongabayHidden = false;
    }

    if (this.selectedShape) this.selectedShape.setEditable(false);
  },

  // Helper
  _toggleHelper: function() {
    if (this.model.get("toggleHelper")) {
      $(".legend").fadeOut(250);
      $(".searchbox").fadeOut(250);
      $(".layer_selector").fadeOut(250);

      if(GFW.app.currentBaseLayer == "loss") {
        TimelineLoss.hide();
        this.$helper.delay(500).fadeIn(250);
      } else if(GFW.app.currentBaseLayer == "quarterly") {
        TimelineModis.hide();
        this.$helper.delay(500).fadeIn(250);
      } else if(GFW.app.currentBaseLayer == "brazilian_amazon") {
        TimelineImazon.hide();
        this.$helper.delay(500).fadeIn(250);
      } else {
        this.$helper.fadeIn(500);
      }
    } else {
      this.$helper.fadeOut(250);
      this._disableDoneButton();

      setTimeout(function() {
        if (GFW.app.currentBaseLayer === "loss") TimelineLoss.show();
        if (GFW.app.currentBaseLayer === "semi_monthly") Timeline.show();
        if (GFW.app.currentBaseLayer === "quarterly") TimelineModis.show();
        if (GFW.app.currentBaseLayer === "brazilian_amazon") TimelineImazon.show();

        $(".legend").fadeIn(250);
        $(".searchbox").fadeIn(250);
        $(".layer_selector").fadeIn(250);
     }, 300);
    }
  },

  _showHelper: function() {
    this.model.set("toggleHelper", true);
  },

  _hideHelper: function() {
    this.model.set("toggleHelper", false);
  },

  render: function() {
    var that = this;

    this.$el.append(this.template.render( this.model.toJSON() ));

    this.$helper = this.$(".analysis.helper_bar");
    this.$doneButton = this.$(".done");

    var analysisModel = new gfw.ui.model.AnalysisInfo({
      show: false,
      subtitle: "Getting dates...",
      ha: "",
      alert_count: "Analyzing...",
      closed: false
    });

    this.buttonModel = new gfw.ui.model.AnalysisButton({
      tip: "Analyze an area on the map"
    });

    this.info = new gfw.ui.view.AnalysisInfo({
      model: analysisModel
    });

    this.button = new gfw.ui.view.AnalysisButton({
      model: this.buttonModel
    });

    $("#map").append(this.button.render());
    $("#map").append(this.info.render());

    return this.$el;
  }
});

gfw.ui.model.AnalysisSubscribe = Backbone.Model.extend({

  defaults: {
    title: "Subscribe to alerts",
    subtitle: "You will receive a monthly email summarizing forest change in this area",
    hidden: false,
    placeholder: "Enter your email",
    mode: "subscribe",
    button_title: "SUBSCRIBE",
    input_type: "text"
  }

});

gfw.ui.view.AnalysisSubscribe = gfw.ui.view.Widget.extend({

  className: 'analysis_subscribe',

  events: {

    "click .invite": "_gotoInvite",
    "click .send":   "_send",
    'click a.close'   : 'hide'

  },

  defaults: {
    speed: 250,
    minHeight: 15
  },

  initialize: function() {

    // if (!this.analyzing) return;

    _.bindAll( this, "toggle", "_toggleMode", "_updateTitle", "_updateHelp", "_updateButtonTitle", "_updateSubtitle", "_updatePlaceholder", "_updateInputType", "_onKeyUp", "_sendData" );

    this.options = _.extend(this.options, this.defaults);

    this.model = new gfw.ui.model.AnalysisSubscribe();

    this.add_related_model(this.model);

    this.model.bind("change:hidden", this.toggle);

    this.model.bind("change:title",         this._updateTitle);
    this.model.bind("change:button_title",  this._updateButtonTitle);
    this.model.bind("change:subtitle",      this._updateSubtitle);
    this.model.bind("change:help",          this._updateHelp);
    this.model.bind("change:placeholder",   this._updatePlaceholder);
    this.model.bind("change:input_type",    this._updateInputType);
    this.model.bind("change:mode",          this._toggleMode);

    this.$backdrop = $(".white_backdrop");

    var template = $("#analysis_subscribe-template").html();

    this.template = new cdb.core.Template({
      template: template,
      type: 'mustache'
    });

  },

  show: function() {
    $(".backdrop").fadeIn(250);
    this.$el.fadeIn(250);

    $(document).on("keyup", this._onKeyUp);
  },

  hide: function(e) {
    var that = this;

    this.$el.fadeOut(250, function() {
      that._clearErrors();
      that._setMode("subscribe");
    });

    this.$backdrop.fadeOut(250);

    $(document).off("keyup");
  },

  _onKeyUp: function(e) {

    // if (e.which == 27) this._onEscKey(e);

  },

  _onEscKey: function(e) {
    e && e.preventDefault();
    e && e.stopImmediatePropagation();

    this.hide();

  },

  _onKeyPress: function(e) {
    debugger;

    e.preventDefault();
    e.stopPropagation();

    if (e.keyCode == 13) {
      this._send(e);
    } else {
      this._clearErrors();
    }

  },

  _clearErrors: function() {

    this.$el.find(".input-field .icon.error").fadeOut(250);
    this.$el.find(".input-field").removeClass("error");
    this.$el.find(".input-field .error_input_label").fadeOut(250);
    this.$el.find(".input-field .error_input_label").html("");

  },

  _send: function(e) {
    var that = this;

    e.preventDefault();
    e.stopPropagation();

    var mode = this.model.get("mode");
    var error = false;

    if (mode == "subscribe") {

      this._clearErrors();

      var email = this.$el.find("input.field").val();
      if (!validateEmail(email)) {
        this.$el.find(".input-field").addClass("error");
        this.$el.find(".input-field").find(".icon.error").fadeIn(250);
        this.$el.find(".input-field").find(".error_input_label").html("Please enter a valid email");
        this.$el.find(".input-field").find(".error_input_label").fadeIn(250);

        error = true;
      }

      if (!error) {
        that._sendData();
      }

    } else {
      this.hide();
    }

  },

  _sendData: function() {

    var
    that      = this,
    $form     = this.$el.find("form"),
    $the_geom = $form.find('#area_the_geom');

    if (Analysis.selectedShapes && Analysis.selectedShapes.length > 0) {
      s = Analysis.selectedShapes;
      $the_geom.val(JSON.stringify({
        "type": "MultiPolygon",
        "coordinates": [
          $.map(s, function(shape, index) {
            return [
              $.map(shape.getPath().getArray(), function(latlng, index) {
                return [[latlng.lng().toFixed(4), latlng.lat().toFixed(4)]];
              })
            ]
          })
        ]
      }));
    } else {
      s = Analysis.selectedShape;
      $the_geom.val(JSON.stringify({
        "type": "MultiPolygon",
        "coordinates": [[
          $.map(s.getPath().getArray(), function(latlng, index) {
            return [[latlng.lng().toFixed(4), latlng.lat().toFixed(4)]];
          })
        ]]
      }));

    }

    var form_data = '{"topic": "updates/forma", "geom": '+$the_geom.val()+', "email": "'+$form.find("#area_email").val()+'"}';

    $.ajax({
        type: 'POST',
        url: $form.attr('action'),
        crossDomain: true,
        data: form_data,
        dataType: 'json',
        success: function(responseData, textStatus, jqXHR) {
          that._setMode("thanks");
          Analysis._clearAnalysis();
          Analysis.info.hide();
        },
        error: function (responseData, textStatus, errorThrown) {
          alert('POST failed.');
        }
    });


  },

  _gotoInvite: function(e) {
    e.preventDefault();
    e.stopPropagation();

    this._setMode("request");
  },

  _setMode: function(mode) {

    this._clearErrors();

    if (mode == "subscribe") {

      this.model.set({ title: this.model.defaults.title, help: this.model.defaults.subtitle, button_title: this.model.defaults.button_title, placeholder: this.model.defaults.placeholder, input_type: "email", mode: mode })
      this.$el.find("input").val("");
      this.$el.find("input").focus();
    } else if (mode == "thanks") {
      this.model.set({ title: "Thank you", help: "You're now subscribed to this area", button_title: "Close", mode: mode })
      this.$("input").val("");
    }

  },

  _toggleMode: function() {

    var mode = this.model.get("mode");

    if (mode == "subscribe") {
      this.$(".subtitle").fadeOut(250);;
      this.$(".help").fadeIn(250);
      this.$(".input-field").show();
    } else if (mode == "thanks") {
      this.$(".subtitle").fadeOut(250);;
      this.$(".help").fadeIn(250);
      this.$(".input-field").hide();
    }

  },

  _updatePlaceholder: function() {
    this.$el.find(".holder").html(this.model.get("placeholder"));
  },

  _updateInputType: function() {
    this.$el.find(".field").prop("type", this.model.get("input_type"));
  },

  _updateHelp: function() {
    this.$el.find(".help").html(this.model.get("help"));
  },

  _updateSubtitle: function() {
    this.$el.find(".subtitle").html(this.model.get("subtitle"));
  },

  _updateButtonTitle: function() {
    this.$el.find(".send span").html(this.model.get("button_title"));
  },

  _updateTitle: function() {
    //
    this.$el.find(".title").html(this.model.get("title"));
  },

  render: function() {
    var that = this;

    //$("body").css("overflow", "hidden");

    // if (!this.analyzing) return;
    this.$el.append(this.template.render( this.model.toJSON() ));

    $(this.$el.find(".input-field")).smartPlaceholder();


    return this.$el;
  }

});
