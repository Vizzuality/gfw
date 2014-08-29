/**
 * The ThresholdView view.
 *
 * @return ThresholdView view (extends Backbone.View)
 */
define([
  'underscore',
  'handlebars',
  'views/Widget',
  'presenters/ThresholdPresenter',
  'text!templates/threshold.handlebars'
], function(_, Handlebars, Widget, Presenter, tpl) {

  'use strict';

  var ThresholdView = Widget.extend({

    className: 'widget widget-threshold',

    template: Handlebars.compile(tpl),

    options: {
      hidden: true,
      boxHidden: true,
      boxClosed: false
    },

    events: function(){
      return _.extend({}, ThresholdView.__super__.events, {
        'change .slider': '_updateThreshold',
        'input .slider': '_setVisibleRange',
        'click .slider-labels > li': '_onClickLabel',
        'click .close' : '_toggleBoxHidden'
      });
    },

    /**
     * Map input values > threshold
     */
    valuesMap: {
      10: 10,
      20: 15,
      30: 20,
      40: 25,
      50: 30,
      60: 50,
      70: 75
    },

    initialize: function() {
      this.presenter = new Presenter(this);
      ThresholdView.__super__.initialize.apply(this);
    },

    _cacheSelector: function() {
      ThresholdView.__super__._cacheSelector.apply(this);
      this.$slider = this.$el.find('.slider');
      this.$visibleRange = this.$el.find('.visible-range');
    },

    _updateThreshold: function() {
      this.presenter.setThreshold(this.valuesMap[this.$slider.val()]);
      this._setVisibleRange();
    },

    _setVisibleRange: function() {
      this.$visibleRange = this.$visibleRange.css('width', '{0}%'.format(
        ((100/7) * ((80 - this.$slider.val()) / 10) + 0.8)
      ));
    },

    _onClickLabel: function(e) {
      var val = $(e.currentTarget).data('slider-value');
      this.$slider.val(val);
      this._updateThreshold();
    },

    /**
     * Used by ThresholdPresenter to update the threshold view.
     *
     * @param  {object}  layers    layers objects
     * @param  {integer} threshold threshold value
     */
    update: function(threshold) {
      var html = this.template({
        valuesMap: this.valuesMap
      });

      this._update(html);

      var val = _.invert(this.valuesMap)[threshold] ||
        _.keys(this.valuesMap)[0];

      this.$slider.val(val);
      this._setVisibleRange();
    }
  });

  return ThresholdView;

});
