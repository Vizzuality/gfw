/**
 * The Forma 250 (2016) layer module for use on canvas.
 *
 * @return FormaLayer class (extends CanvasLayerClass)
 */
define([
  'bluebird', 'uri', 'd3', 'mps', 'moment',
  'abstract/layer/AnimatedCanvasLayerClass',
  'map/presenters/layers/Forma2016LayerPresenter'
], function(
  Promise, UriTemplate, d3, mps, moment,
  AnimatedCanvasLayerClass,
  Presenter
) {

  'use strict';

  var TILE_URL = 'https://storage.googleapis.com/forma-public/FORMA_TILES/biweekly/run_20170203-173006/forma_biweekly_2016_19/{/z}{/x}{/y}';
  var START_DATE = '2012-01-01';
  var END_DATE = '2016-12-31';
  var START_YEAR = 2012;

  var padNumber = function(number) {
    var s = "00" + number;
    return s.substr(s.length - 3);
  };

  var Forma2016Layer = AnimatedCanvasLayerClass.extend({

    init: function(layer, options, map) {
      this.presenter = new Presenter(this);
      this._super(layer, options, map);
      this.options.showLoadingSpinner = true;
      this.options.dataMaxZoom = 9;
      this._setupAnimation();

      this.currentDate = [
        (!!options.currentDate && !!options.currentDate[0]) ?
        moment.utc(options.currentDate[0]) : moment.utc(START_DATE),
        (!!options.currentDate && !!options.currentDate[1]) ?
        moment.utc(options.currentDate[1]) : moment.utc(),
      ];

      this.maxDate = this.currentDate[1];
    },

    _getLayer: function() {
      return new Promise(function(resolve) {
        this._checkMaxDate();
        mps.publish('Place/update', [{
          go: false
        }]);

        resolve(this);
      }.bind(this));
    },

    _getUrl: function(x, y, z) {
      return new UriTemplate(TILE_URL).fillFromObject({
        x: x,
        y: y,
        z: z
      });
    },

    _checkMaxDate: function() {
      var maxDataDate = moment.utc(END_DATE);
      if (this.maxDate.isAfter(maxDataDate)) {
        this.maxDate = maxDataDate;
        this.currentDate[1] = this.maxDate;
      }
    },

    setCurrentDate: function(date) {
      this.timelineExtent[0] = date[0];
      this.timelineExtent[1] = date[1];
      this.updateTiles();
    },

    filterCanvasImgdata: function(imgdata, w, h, z) {
      if (this.timelineExtent === undefined) {
        this.timelineExtent = [moment.utc(this.currentDate[0]),
          moment.utc(this.currentDate[1])
        ];
      }

      var components = 4;
      var baseDate = moment.utc(START_DATE);
      var startDate = this.timelineExtent[0];
      var endDate = this.timelineExtent[1];
      var start = Math.abs(baseDate.diff(startDate, 'days'));
      var end = Math.abs(baseDate.diff(endDate, 'days'));

      for (var i = 0; i < w; ++i) {
        for (var j = 0; j < h; ++j) {
          var pixelPos = (j * w + i) * components;
          var r = imgdata[pixelPos];
          var g = imgdata[pixelPos + 1];
          var b = imgdata[pixelPos + 2];
          var timeLoss = (255 * g) + b;
          var intensity = 0;

          if (timeLoss >= start && timeLoss <= end) {
            var band3_str = padNumber(imgdata[pixelPos].toString());
            var intensity_raw = parseInt(band3_str.slice(1, 3), 10);
            // Scale the intensity to make it visible
            var intensity = intensity_raw * 55;
            // Set intensity to 255 if it's > than that value
            if (intensity > 255) { intensity = 255; }

            imgdata[pixelPos] = 220;
            imgdata[pixelPos + 1] = 102;
            imgdata[pixelPos + 2] = 153;
            imgdata[pixelPos + 3] = intensity;

            continue;
          }
          imgdata[pixelPos + 3] = 0;
        }
      }
    }
  });

  return Forma2016Layer;

});
