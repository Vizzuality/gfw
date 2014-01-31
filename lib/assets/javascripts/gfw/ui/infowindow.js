function CartoDBInfowindow(map, opts) {
  this.latlng_ = null;
  this.offsetHorizontal_ = 0;
  this.offsetVertical_   = -10;
  this.width_ = 255;
  this.div_ = null;
  this.map_ = map;
  this.setMap(map);

  if (opts) {
    this.className         = opts.className;
    this.offsetHorizontal_ = ("offsetHorizontal" in opts) ? opts.offsetHorizontal : 0;
    this.offsetVertical_   = ("offsetVertical" in opts) ? opts.offsetVertical : 0;
    this.width_            = opts.width;
    this.template          = opts.template;
  }
}


CartoDBInfowindow.prototype = new google.maps.OverlayView();


CartoDBInfowindow.prototype.draw = function() {
  var me = this,
      div = this.div_;

  if (!div) {
    div = this.div_ = document.createElement('DIV');

    div.className = this.className || "cartodb_infowindow";

    this.template_image = '<a href="#close" class="close"></a>'+
      '<div class="outer_top">'+
      '<div class="top">'+
      '<div class="protected-header">'+
      '<h1></h1><div class="cover imgLiquidFill" style="width:295px; height:120px;"><img src="/assets/backgrounds/cover.png" /></div>'+
      '</div>'+
      '<div class="infowindow_content"></div>'+
      '</div>'+
      '</div>'+
      '<div class="shadow"></div>'+
      '<div class="bottom"></div>';

    this.template_base = '<a href="#close" class="close"></a>'+
      '<div class="outer_top">'+
      '<div class="top">'+
      '<div class="infowindow_content"></div>'+
      '</div>'+
      '</div>'+
      '<div class="shadow"></div>'+
      '<div class="bottom"></div>';

    div.innerHTML = this.template || this.template_base;

    var a = this.getElementsByClassName("close", div)[0];

    google.maps.event.addDomListener(div, 'touchstart', function (ev) {
      ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
    });

    google.maps.event.addDomListener(div, 'touchend', function (ev) {
      ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
    });

    google.maps.event.addDomListener(div, 'dblclick', function (ev) {
      ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
    });

    google.maps.event.addDomListener(div, 'mousedown', function (ev) {
      ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
      ev.stopPropagation ? ev.stopPropagation() : window.event.cancelBubble = true;
    });

    google.maps.event.addDomListener(div, 'mouseup', function (ev) {
      ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
    });

    google.maps.event.addDomListener(div, 'mousewheel', function (ev) {
      ev.stopPropagation ? ev.stopPropagation() : window.event.cancelBubble = true;
    });

    google.maps.event.addDomListener(div, 'DOMMouseScroll', function (ev) {
      ev.stopPropagation ? ev.stopPropagation() : window.event.cancelBubble = true;
    });

    var panes = this.getPanes();
    panes.floatPane.appendChild(div);

    div.style.opacity = 0;
  }

  this.setPosition();
};


CartoDBInfowindow.prototype.setVisibleColumns = function(columns){
  this.visible_columns = columns;
},


CartoDBInfowindow.prototype.setMode = function(mode){
  this.mode = mode;

  if (this.mode == "image") {
    this.template = this.template_image;
    this.div_.innerHTML = this.template;
    this.div_.className = "cartodb_infowindow with_image_small with_image_2";
  } else {
    this.template = this.template_base;
    this.div_.innerHTML = this.template;
    this.div_.className = "cartodb_infowindow";
  }
};


CartoDBInfowindow.prototype.setTemplate = function(template){
  this.template_ = template;
};


CartoDBInfowindow.prototype.setOffset = function(offsetVertical, offsetHorizontal){
  this.offsetHorizontal_ = offsetHorizontal;
  this.offsetVertical_   = offsetVertical;
};


CartoDBInfowindow.prototype.setContent = function(content){
  if (this.div_) {

    var div = this.div_,
        top = this.getElementsByClassName("infowindow_content", div)[0];

    if (!content) { return; }

    if (typeof content === 'string') {
      top.innerHTML = content;
    } else {
      top.innerHTML = '';
      var html = '';

      function show_column(column, content, visible_columns) {
        if (!visible_columns) {
          return column != "slug" && content[column] != null && content[column] != '';
        } else {
          return column != "slug" && content[column] != null && content[column] != '' && _.contains(visible_columns, column);
        }
      }

      for(var column in content) {
        if (show_column(column, content, this.visible_columns)) {
          html += '<label>' + column + '</label>';
          html += '<p class="'+((content[column]!=null && content[column]!='')?'':'empty')+'">'+(content[column] || 'empty')+'</p>';
        }
      }

      top.innerHTML = html;

      var pane = $(".cartodb_infowindow .top").jScrollPane();
      var api = pane.data('jsp');
      api.scrollToY(0); // scroll to top

      if (this.mode == "image") {
        $(div).find("h1").html(content.name);
        $(div).find("img").attr("src", content.image.replace("square", "medium"));
        $(div).find("img").css("width", "295px");
      }
    }
  }
};


CartoDBInfowindow.prototype.setPosition = function(latlng) {
  if (latlng) {
    this.latlng_ = latlng;
    // Adjust pan
    this._adjustPan();
  }

  if (this.div_) {
    var div = this.div_
    , pixPosition = this.getProjection().fromLatLngToDivPixel(this.latlng_);
    if (pixPosition) {
      div.style.width = this.width_ + 'px';
      div.style.left = (pixPosition.x - this.width_ / 2 + this.offsetHorizontal_) + 'px';
      var actual_height = - div.clientHeight;
      div.style.top = (pixPosition.y + actual_height + this.offsetVertical_) + 'px';
    }
  }
};


CartoDBInfowindow.prototype.open = function(){
  this._show();
};


CartoDBInfowindow.prototype.close = function(){
  this._hide();
};


CartoDBInfowindow.prototype.destroy = function() {
  // Check if the overlay was on the map and needs to be removed.
  if (this.div_) {
    this.div_.parentNode.removeChild(this.div_);
    this.div_ = null;
  }

  this.setMap(null);
};


CartoDBInfowindow.prototype._hide = function() {
  if (this.div_) {
    var div = this.div_;

    $(div).animate({
      opacity: 0,
      duration: 1
    }, function() {
      div.style.visibility = "hidden";
    });
  }
};


CartoDBInfowindow.prototype._show = function() {
  if (this.div_) {
    var div = this.div_;
    div.style.opacity = 0;
    div.style.top = (parseInt(div.style.top, 10) - 10) + 'px';

    div.style.visibility = "visible";

    if (this.mode === "image") {
      $(".imgLiquidFill").imgLiquid();
    }

    $(div).animate({
      opacity: 1,
      duration: 250
    });
  }
};


CartoDBInfowindow.prototype._adjustPan = function() {
  var left = 0,
      top = 0,
      pixPosition = this.getProjection().fromLatLngToContainerPixel(this.latlng_),
      container = this.map_.getDiv(),
      div_height = this.div_.clientHeight;

  if ((pixPosition.x - 65) < 0) {
    left = (pixPosition.x - 65);
  }

  if ((pixPosition.x + 180) >= container.clientWidth) {
    left = (pixPosition.x + 180 - container.clientWidth);
  }

  if ((pixPosition.y - div_height) < 0) {
    top = (pixPosition.y - div_height - 20);
  }

  this.map_.panBy(left,top);
};


CartoDBInfowindow.prototype.getElementsByClassName = function(classname, node)  {
  if(!node) node = document.getElementsByTagName("body")[0];

  var a = [],
      re = new RegExp('\\b' + classname + '\\b'),
      els = node.getElementsByTagName("*");

  for(var i=0,j=els.length; i<j; i++) {
    if(re.test(els[i].className))a.push(els[i]);
  }

  return a;
}
