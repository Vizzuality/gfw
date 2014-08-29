/**
 * The Indonesia Primary Forest layer module.
 *
 * @return IdnPrimaryLayer class (extends ImageLayerClass)
 */
define([
  'views/layers/class/ImageLayerClass',
], function(ImageLayerClass) {

  'use strict';

  var IdnPrimaryLayer = ImageLayerClass.extend({

    options: {
      urlTemplate: 'https://s3.amazonaws.com/wri-idn/idnpf_static_soft/{z}/{x}/{y}.png',
      dataMaxZoom: 12
    }

  });

  return IdnPrimaryLayer;

});
