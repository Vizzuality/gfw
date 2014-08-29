/**
 * The MaptypePresenter class for the MaptypePresenter view.
 *
 * @return MaptypePresenter class.
 */
define([
  'Class',
  'underscore',
  'mps'
], function(Class, _, mps) {

  'use strict';

  var MaptypePresenter = Class.extend({

    /**
     * Initialize MaptypePresenter.
     *
     * @param  {object} Instance of MaptypePresenter view
     */
    init: function(view) {
      this.view = view;
      this._subscribe();
    },

    /**
     * Subscribe to application events.
     */
    _subscribe: function() {
      mps.subscribe('Map/maptype-change', _.bind(function(maptype) {
        this.view.selectMaptype(maptype);
      }, this));

      mps.subscribe('AnalysisTool/stop-drawing', _.bind(function() {
        this.view.model.set('hidden', false);
      }, this));

      mps.subscribe('AnalysisTool/start-drawing', _.bind(function() {
        this.view.model.set('hidden', true);
      }, this));
    },

    setMaptype: function(maptype) {
      mps.publish('Maptype/change', [maptype]);
    }
  });

  return MaptypePresenter;
});
