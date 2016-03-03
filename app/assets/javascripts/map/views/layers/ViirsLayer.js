/**
 * The Fires layer module.
 *
 * @return FiresLayer class (extends CartoDBLayerClass)
 */
define([
  'underscore',
  'moment',
  'uri',
  'abstract/layer/CartoDBLayerClass',
  'map/presenters/layers/FiresLayerPresenter'
], function(_, moment, UriTemplate, CartoDBLayerClass, Presenter) {

  'use strict';

  var ViirsLayer = CartoDBLayerClass.extend({
    options: {
      sql: "SELECT the_geom_webmercator, \'{tableName}\' as tablename,\'{tableName}\' AS layer, acq_time,  COALESCE(to_char(acq_date, \'DD Mon, YYYY\')) as acq_date, confidence, bright_ti4 brightness, longitude, latitude FROM {tableName} WHERE acq_date >= \'{year}-{month}-{day}\' AND confidence != 'low'",
      interactivity: 'acq_time, acq_date, confidence, brightness, longitude, latitude',
      infowindow: true
    },

    init: function(layer, options, map) {
      _.bindAll(this, 'setCurrentDate');
      this.presenter = new Presenter(this);

      // Default to 48 hours
      this.setCurrentDate(options.currentDate ||
        [moment().subtract(24, 'hours'), moment()]);

      this._super(layer, options, map);
    },

    getQuery: function() {
      var query = new UriTemplate(this.options.sql).fillFromObject({
        tableName: this.layer.table_name,
        year: moment(this.currentDate[0]).year(),
        month: moment(this.currentDate[0]).format('MM'),
        day: moment(this.currentDate[0]).format('DD')
      });

      return query;
    },

    /**
     * Used by FiresLayerPresenter to set the dates for the tile.
     *
     * @param {Array} date 2D array of moment dates [begin, end]
     */
    setCurrentDate: function(date) {
      this.currentDate = date;
    }
  });

  return ViirsLayer;
});
