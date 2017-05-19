define([
  'jquery',
  'backbone',
  'underscore',
  'handlebars',
  'moment',
  'uri',
  'text!countries/templates/widgets/nearRealTimeAlerts.handlebars'
], function($, Backbone, _, Handlebars, moment, UriTemplate, tpl) {

  'use strict';

  var API = window.gfw.config.GFW_API_HOST_PROD;
  var DATASET_VIIRS = '20cc5eca-8c63-4c41-8e8e-134dcf1e6d76';
  var DATASET_GLAD = '5608af77-1038-4d5d-8084-d5f49e8323a4';
  var QUERY_VIIRS = '/query?sql=SELECT count(*) as value FROM {dataset} WHERE acq_date = \'{date}\'';
  var QUERY_GLAD = '/query?sql=SELECT sum(alerts) as value FROM {dataset} WHERE year={year} AND month={month} AND country_iso=\'{iso}\' GROUP BY country_iso';

  var NearRealTimeAlertsView = Backbone.View.extend({
    el: '#widget-near-real-time-alerts',

    template: Handlebars.compile(tpl),

    initialize: function(params) {
      this.iso = params.iso;
      this.data = [];

      this._start();
    },

    _start: function() {
      $.when.apply($, [this._getViirsData(), this._getGladData()])
        .then(function(schemas) {
          this.render();
        }.bind(this));
    },

    render: function() {
      this.$el.html(this.template({
        data: this.data
      }));
      this.$el.removeClass('-loading');
    },

    _getViirsData: function() {
      var $deferred = $.Deferred();
      var url = API + new UriTemplate(QUERY_VIIRS).fillFromObject({
        dataset: DATASET_VIIRS,
        iso: this.iso,
        date: moment.utc().subtract(1, 'days').format('YYYY/MM/DD')
      });

      console.log(url);

      $.ajax({
        url: url,
        type: 'GET'
      })
      .done(function(res) {
        if (res.data && res.data.length > 0) {
          this.data['glad'] = res.data;
        }
        return $deferred.resolve();
      }.bind(this))
      .fail(function(error) {
        return $deferred.reject();
      });
      return $deferred;
    },

    _getGladData: function() {
      var $deferred = $.Deferred();
      var currentDate = moment.utc();
      var url = API + new UriTemplate(QUERY_GLAD).fillFromObject({
        dataset: DATASET_GLAD,
        iso: this.iso,
        year: currentDate.year(),
        month: currentDate.month() - 1
      });

      $.ajax({
        url: url,
        type: 'GET'
      })
      .done(function(res) {
        if (res.data && res.data.length > 0) {
          this.data['viirs'] = res.data;
        }
        return $deferred.resolve();
      }.bind(this))
      .fail(function(error) {
        return $deferred.reject();
      });
      return $deferred;
    }
  });
  return NearRealTimeAlertsView;

});
