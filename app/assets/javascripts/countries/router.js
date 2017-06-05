define([
  'jquery',
  'backbone',
  'underscore',
  'urijs/URI',
  'countries/views/CountryListView',
  'countries/views/CountryOverviewView',
  'countries/views/CountryShowView'
], function($, Backbone, _, URI, CountryListView, CountryOverviewView, CountryShowView) {

  'use strict';

  var Router = Backbone.Router.extend({

    routes: {
      'countries': 'showList',
      'countries/overview': 'showOverview',
      'countries/:iso(/)': 'showCountry',
      'countries/:iso(/):region(/)': 'showCountryRegion',
    },

    showList: function() {
      new CountryListView();
    },

    showOverview: function() {
      new CountryOverviewView();
    },

    showCountry: function(iso, region) {
      this.iso = iso;
      this.region = region;

      this.countryShow = new CountryShowView({
        iso: iso,
        region: 0
      });

      this.listenTo(
         this.countryShow ,
         'updateUrl',
         this.updateUrl
      );
    },

    showCountryRegion: function(iso, region) {
      this.routerChange = false;
      this.countryShow = new CountryShowView({
        iso: iso,
        region: region
      });

      this.listenTo(
         this.countryShow ,
         'updateUrl',
         this.updateUrl
      );
    },

    startHistory: function() {
      if (!Backbone.History.started) {
        Backbone.history.start({
          pushState: true
        });
      }
    },

    updateUrl: function() {
      var region = $('#areaSelector').val();
      var uri = new URI();
      if(region != 0 ){
        if(this.region) {
          this.navigate(uri.path().slice(0, uri.path().lastIndexOf('/')) +'/'+region);
        } else {
          this.region = true;
          this.navigate(uri.path().slice(0, uri.path().lastIndexOf('/')) +'/'+this.iso+'/'+region);
        }
      } else {
        this.region = false;
        this.navigate(uri.path().slice(0, uri.path().lastIndexOf('/')));
      }
    },
  });

  return Router;

});
