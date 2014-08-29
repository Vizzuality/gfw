gfw.ui.view.CountriesOverview = cdb.core.View.extend({

  el: document.body,

  events: {
    'click .info': '_openSource',
    'click .graph_tab': '_updateGraph',
    'click .countries_list__footer': '_drawList',
    'click .country-overview-wrapper-coolio .umdoptions_dialog #canopy_slider':  '_updateGraphOverview',
    'mouseup .country-overview-wrapper-coolio .umdoptions_dialog #canopy_slider':  '_updateGraphOverview',
    'click .country-overview-wrapper-coolio .umdoptions_dialog ul li':  '_updateGraphOverview'
  },

  initialize: function() {
    this.model = new gfw.ui.model.CountriesOverview();
    this.headerView = new gfw.ui.view.CountryHeader({country: this.country});
    this.$graph = $('.overview_graph__area');
    this.$years = $('.overview_graph__years');

    var m = this.m = 40,
        w = this.w = this.$graph.width()+(m*2),
        h = this.h = this.$graph.height(),
        vertical_m = this.vertical_m = 20;

    this.x_scale = d3.scale.linear()
      .range([m, w-m])
      .domain([2001, 2012]);

    this.grid_scale = d3.scale.linear()
      .range([vertical_m, h-vertical_m])
      .domain([0, 1]);

    this.model.bind('change:graph', this._redrawGraph, this);
    this.model.bind('change:years', this._toggleYears, this);
    this.model.bind('change:class', this._toggleClass, this);

    this._initViews();
  },

  _initViews: function() {
    this.sourceWindow = new gfw.ui.view.SourceWindow();
    this.$el.append(this.sourceWindow.render());

    this.tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip');

    this._drawYears();
    this._drawGraph();
    this._drawList();

    Share = new gfw.ui.view.Share({template: 'country'});
    this.$el.find('.overview_button_group .share').append(Share.render());
  },

  _openSource: function(e) {
    e.preventDefault();

    var source = $(e.target).closest('.info').attr('data-source');

    ga('send', 'event', 'SourceWindow', 'Open', source);
    //this.sourceWindow.show(source).addScroll(); --> jspscrollpane thinks it's better to break the window
    this.sourceWindow.show(source);
  },

  _toggleYears: function() {
    var that = this;

    if (this.model.get('years') === false) {
      this.$years.slideUp(250, function() {
        $('.overview_graph__axis').slideDown();
      });
    } else {
      $('.overview_graph__axis').slideUp(250, function() {
        that.$years.slideDown();
      });
    }
  },

  _showYears: function() {
    if (!this.model.get('years')) {
      this.model.set('years', true);
    }
  },

  _hideYears: function() {
    if (this.model.get('years')) {
      this.model.set('years', false);
    }
  },

  _updateGraph: function(e) {
    e.preventDefault();

    var $target = $(e.target).closest('.graph_tab'),
        graph = $target.attr('data-slug');

    if (graph === this.model.get('graph')) {
      return;
    } else {
      $('.graph_tab').removeClass('selected');
      $target.addClass('selected');

      this.model.set('graph', graph);
    }
  },

  _redrawGraph: function() {
    var graph = this.model.get('graph');
    var $legend = $('.overview_graph__legend');
    $('.overview_graph__title').html(config.GRAPHS[graph].title);
    $legend.find('p').html(config.GRAPHS[graph].subtitle);
    $legend.find('.info').attr('data-source', graph);

    this.$graph.find('.'+graph);

    this.$graph.find('.chart').hide();
    this.$graph.find('.'+graph).fadeIn();

    this._drawGraph();
    this._drawList();
  },
  _updateGraphOverview: function(e) {
    var $cnp_op = this.$el.find('.overview_button_group .settings i')
    if (config.canopy_choice != 10) $cnp_op.addClass('no_def');
    else $cnp_op.removeClass('no_def');

    this._drawYears();
    this._drawGraph();
    this._drawList();
  },

  _drawList: function(e) {
    var that = this;

    e && e.preventDefault();

    if (this.model.get('graph') === 'total_loss') {
      var sql = 'WITH loss as (SELECT iso, SUM(';

      for(var y = 2001; y < 2012; y++) {
        sql += 'y'+y+' + ';
      }

      sql += 'y2012) as sum_loss\
              FROM countries_loss\
              GROUP BY iso)';

      sql += 'SELECT c.iso, c.name, c.enabled, sum_loss\
              FROM loss, gfw2_countries c\
              WHERE loss.iso = c.iso\
              AND NOT sum_loss = 0\
              ORDER BY sum_loss DESC ';

      if (e) {
        sql += 'OFFSET 10';
      } else {
        sql += 'LIMIT 10';
      }
      d3.json('http://wri-01.cartodb.com/api/v2/sql/?q='+encodeURIComponent(sql), function(json) {
        var self = that,
            markup_list = '';

        var data = json.rows;

        _.each(data, function(val, key) {
          var ord = e ? (key+11) : (key+1),
              enabled = val.enabled ? '<a href="/country/'+val.iso+'">'+val.name+'</a>' : val.name;
              umd = {
                loss : 34,
                gain : 43
              }

          $.ajax({
            url: 'http://beta.gfw-apis.appspot.com/forest-change/umd-loss-gain/admin/' + val.iso+'?thresh=' + (config.canopy_choice || 10),
            dataType: 'json',
            success: function(data) {
              var loss = (config.canopy_choice == false || config.canopy_choice == 10) ? Math.round(val.sum_loss) : 0;
              var gain = 0;
              var g_mha, l_mha;
              g_mha = l_mha = 'Mha';

              for (var i = 0; i<data.years.length; i ++) {
                if (config.canopy_choice != false && config.canopy_choice != 10){
                  loss += data.years[i].loss
                }
                gain += data.years[i].gain
              }

              if (loss.toString().length >= 7) {
                loss = ((loss /1000)/1000).toFixed(2)
              } else if (loss.toString().length >= 4) {
                l_mha = 'KHa';
                loss = (loss /1000);
              if (loss % 1 != 0) loss = loss.toFixed(2)
              } else {
                l_mha = 'Ha';
              }

              if (gain.toString().length >= 7) {
                gain = ((gain /1000)/1000).toFixed(2)
              } else if (gain.toString().length >= 4) {
                g_mha = 'KHa';
                gain = (gain /1000);
              if (gain % 1 != 0) gain = gain.toFixed(2)
              } else {
                g_mha = 'Ha';
              }

              $('#umd_'+val.iso+'').empty().append('<span class="loss line"><span>'+ loss +' </span>'+ l_mha +' of loss</span><span class="gain line"><span>'+ gain+' </span>'+ g_mha +' of gain</span>')
            },
          });
          markup_list += '<li>\
                            <div class="countries_list__minioverview countries_list__minioverview_'+val.iso+'"></div>\
                            <div class="countries_list__num">'+ord+'</div>\
                            <div class="countries_list__title">'+enabled+'</div>\
                            <div class="countries_list__data">\
                              <div id="umd_'+val.iso+'"></div>\
                            </div>\
                          </li>';
        });

        if (e) {
          $('.countries_list__footer').fadeOut();
        } else {
          $('.countries_list ul').html('');
          $('.countries_list__footer').show();

          $('.countries_list__header__minioverview').html('Loss <span>vs</span> Gain');
        }

        $('.countries_list ul').append(markup_list);

        that.model.set('class', null);

        _.each(data, function(val, key) {
          self._drawMiniOverview(val.iso);
        });
      });
    } else if (this.model.get('graph') === 'percent_loss') {
      var sql = 'SELECT c.iso, c.name, c.enabled, loss_y2001_y2012 as ratio_loss\
                 FROM countries_percent percent, gfw2_countries c\
                 WHERE percent.iso = c.iso AND c.enabled IS true\
                 AND NOT loss_y2001_y2012 = 0\
                 ORDER BY ratio_loss DESC ';

      if (e) {
        sql += 'OFFSET 10';
      } else {
        sql += 'LIMIT 10';
      }

      d3.json('http://wri-01.cartodb.com/api/v2/sql/?q='+encodeURIComponent(sql), function(json) {
        var self = that,
            markup_list = '';

        var data = json.rows;

        _.each(data, function(val, key) {
          var ord = e ? (key+11) : (key+1),
              enabled = val.enabled ? '<a href="/country/'+val.iso+'">'+val.name+'</a>' : val.name;

          markup_list += '<li>\
                            <div class="countries_list__minioverview countries_list__minioverview_'+val.iso+'"></div>\
                            <div class="countries_list__num">'+ord+'</div>\
                            <div class="countries_list__title">'+enabled+'</div>\
                            <div class="countries_list__data">\
                              <div id="perc_'+val.iso+'" class="perct"><span class="line percent loss">'+ (val.ratio_loss*100).toFixed(2) +'%</span></div>\
                            </div>\
                          </li>';
        });

        if (e) {
          $('.countries_list__footer').fadeOut();
        } else {
          $('.countries_list ul').html('');
          $('.countries_list__footer').show();

          $('.countries_list__header__minioverview').html('% Loss');
        }

        $('.countries_list ul').empty().append(markup_list);

        that.model.set('class', null);

        _.each(data, function(val, key) {
          self._drawMiniOverview(val.iso);
        });
      });
    } else if (this.model.get('graph') === 'total_extent') {
      var sql = 'WITH extent as (SELECT iso, SUM(';

      for(var y = 2001; y < 2012; y++) {
        sql += 'y'+y+' + ';
      }

      sql += 'y2012) as sum_extent\
              FROM extent_gt_25\
              GROUP BY iso)';

      sql += 'SELECT c.iso, c.name, c.enabled, sum_extent\
              FROM extent, gfw2_countries c\
              WHERE extent.iso = c.iso\
              AND NOT sum_extent = 0\
              ORDER BY sum_extent DESC ';

      if (e) {
        sql += 'OFFSET 10';
      } else {
        sql += 'LIMIT 10';
      }

      d3.json('http://wri-01.cartodb.com/api/v2/sql/?q='+encodeURIComponent(sql), function(json) {
        var self = that,
            markup_list = '';

        var data = json.rows;

        _.each(data, function(val, key) {
          var ord = e ? (key+11) : (key+1),
              enabled = val.enabled ? '<a href="/country/'+val.iso+'">'+val.name+'</a>' : val.name;

          $.ajax({
            url: 'http://beta.gfw-apis.appspot.com/forest-change/umd-loss-gain/admin/' + val.iso+'?thresh=' + (config.canopy_choice || 10),
            dataType: 'json',
            success: function(data) {
              var e_mha, l_mha,
                  ex = data.years[data.years.length -1].extent,
                  lo = data.years[data.years.length -1].loss;
                  e_mha = l_mha = 'Mha';

              if (ex.toString().length >= 7) {
                ex = ((ex /1000)/1000).toFixed(2)
              } else if (ex.toString().length >= 4) {
                e_mha = 'KHa';
                ex = (ex /1000);
              if (ex % 1 != 0) ex = ex.toFixed(2)
              } else {
                e_mha = 'Ha';
              }

              if (lo.toString().length >= 7) {
                lo = ((lo /1000)/1000).toFixed(2)
              } else if (lo.toString().length >= 4) {
                l_mha = 'KHa';
                lo = (lo /1000);
              if (lo % 1 != 0) lo = lo.toFixed(2)
              } else {
                l_mha = 'Ha';
              }
              $('#ext_'+val.iso+'').empty().append('<span class="line"><span>'+ parseInt(ex).toLocaleString() +' </span>'+ e_mha +' of extent</span><span class="loss line"><span>'+ parseInt(lo).toLocaleString() +' </span>'+ l_mha +'  of loss</span>')
            },
          });
          markup_list += '<li>\
                            <div class="countries_list__minioverview expanded countries_list__minioverview_'+val.iso+'"></div>\
                            <div class="countries_list__num">'+ord+'</div>\
                            <div class="countries_list__title">'+enabled+'</div>\
                            <div class="countries_list__data">\
                              <div id="ext_'+val.iso+'"></div>\
                            </div>\
                          </li>';
        });

        if (e) {
          $('.countries_list__footer').fadeOut();
        } else {
          $('.countries_list ul').html('');
          $('.countries_list__footer').show();

          $('.countries_list__header__minioverview').html('Cover extent <span>vs</span> Cover loss');
        }

        $('.countries_list ul').append(markup_list);

        that.model.set('class', 'expanded');

        _.each(data, function(val, key) {
          self._drawMiniOverview(val.iso);
        });
      });
    } else if (this.model.get('graph') === 'ratio') {
      var sql = 'WITH loss as (SELECT iso, SUM(';

      for(var y = 2001; y < 2012; y++) {
        sql += 'loss.y'+y+' + ';
      }

      sql += 'loss.y2012) as sum_loss\
              FROM loss_gt_50 loss\
              GROUP BY iso), gain as (SELECT g.iso, SUM(y2001_y2012) as sum_gain\
                                      FROM countries_gain g, loss_gt_50 loss\
                                      WHERE loss.iso = g.iso\
                                      GROUP BY g.iso), ratio as (';

      sql += 'SELECT c.iso, c.name, c.enabled, loss.sum_loss/gain.sum_gain as ratio\
              FROM loss, gain, gfw2_countries c\
              WHERE sum_gain IS NOT null\
              AND NOT sum_gain = 0\
              AND c.iso = gain.iso\
              AND c.iso = loss.iso\
              ORDER BY loss.sum_loss DESC\
              LIMIT 50) ';

      sql += 'SELECT *\
              FROM ratio\
              WHERE ratio IS NOT null\
              ORDER BY ratio DESC ';

      if (e) {
        sql += ['OFFSET 10',
                'LIMIT 40'].join('\n');
      } else {
        sql += 'LIMIT 10';
      }

      d3.json('http://wri-01.cartodb.com/api/v2/sql/?q='+encodeURIComponent(sql), function(json) {
        var self = that,
            markup_list = '';

        var data = json.rows;

        _.each(data, function(val, key) {
          var ord = e ? (key+11) : (key+1),
              enabled = val.enabled ? '<a href="/country/'+val.iso+'">'+val.name+'</a>' : val.name;

          markup_list += '<li>\
                            <div class="countries_list__minioverview medium countries_list__minioverview_'+val.iso+'">'+formatNumber(parseFloat(val.ratio).toFixed(2))+'</div>\
                            <div class="countries_list__num">'+ord+'</div>\
                            <div class="countries_list__title">'+enabled+'</div>\
                          </li>';
        });

        if (e) {
          $('.countries_list__footer').fadeOut();
        } else {
          $('.countries_list ul').html('');
          $('.countries_list__footer').show();

          $('.countries_list__header__minioverview').html('Ratio of Loss to Gain');
        }

        $('.countries_list ul').append(markup_list);

        that.model.set('class', 'medium');

        _.each(data, function(val, key) {
          self._drawMiniOverview(val.iso);
        });
      });
    } else if (this.model.get('graph') === 'domains') {
      var sql = 'SELECT name, total_loss, total_gain, GREATEST('

      for(var y = 2001; y < 2012; y++) {
        sql += 'y'+y+', '
      }

      sql += 'y2012) as max\
              FROM countries_domains\
              ORDER BY total_loss DESC ';

      d3.json('http://wri-01.cartodb.com/api/v2/sql/?q='+encodeURIComponent(sql), function(json) {
        var self = that,
            markup_list = '';

        var data = json.rows;

        _.each(data, function(val, key) {
          markup_list += ['<li>',
                            '<div class="countries_list__minioverview huge">',
                              '<div class="gain half">'+formatNumber(parseFloat(val.total_loss/1000000).toFixed(1))+' Mha</div>',
                              '<div class="loss half last">'+formatNumber(parseFloat(val.total_gain/1000000).toFixed(1))+' Mha</div>',
                            '</div>',
                            '<div class="countries_list__num">'+(key+1)+'</div>',
                            '<div class="countries_list__title">'+val.name+'</div>',
                          '</li>'].join('');
        });

        $('.countries_list__footer').hide();
        $('.countries_list__header__minioverview').html('Total loss <span>vs</span> Total gain');
        $('.countries_list ul').html(markup_list);

        that.model.set('class', 'huge');

        _.each(data, function(val, key) {
          self._drawMiniOverview(val.iso);
        });
      });
    }
  },

  _toggleClass: function() {
    if (this.model.get('class') === 'expanded') {
      $('.countries_list__header__minioverview').addClass('expanded');
      $('.countries_list__minioverview').addClass('expanded');

      $('.countries_list__header__minioverview').removeClass('medium huge');
      $('.countries_list__minioverview').removeClass('medium huge');
    } else if (this.model.get('class') === 'medium') {
      $('.countries_list__header__minioverview').addClass('medium');
      $('.countries_list__minioverview').addClass('medium');

      $('.countries_list__header__minioverview').removeClass('expanded huge');
      $('.countries_list__minioverview').removeClass('expanded huge');
    } else if (this.model.get('class') === 'huge') {
      $('.countries_list__header__minioverview').addClass('huge');
      $('.countries_list__minioverview').addClass('huge');

      $('.countries_list__header__minioverview').removeClass('expanded medium');
      $('.countries_list__minioverview').removeClass('expanded medium');
    } else {
      $('.countries_list__header__minioverview').removeClass('expanded medium huge');
      $('.countries_list__minioverview').removeClass('expanded medium huge');
    }
  },

  _drawMiniOverview: function(iso) {
    var width   = 90,
        height  = 30;

    var graph = d3.select('.countries_list__minioverview_'+iso)
      .append('svg:svg')
      .attr('width', width)
      .attr('height', height);

    if (this.model.get('graph') === ('total_loss')) {
      var sql = 'SELECT ';

      for(var y = 2001; y < 2012; y++) {
        sql += 'y'+y+', '
      }

      sql += "y2012, (SELECT y2001_y2012\
                      FROM countries_gain\
                      WHERE c.iso = iso) as gain\
              FROM loss_gt_0 c \
              WHERE iso = '"+iso+"'";

      d3.json('https://wri-01.cartodb.com/api/v2/sql?q='+sql, function(json) {
        var data = json.rows[0];

        var data_ = [],
            gain = null;

        _.each(data, function(val, key) {
          if (key === 'gain') {
            gain = val/12;
          } else {
            data_.push({
              'year': key.replace('y',''),
              'value': val
            });
          }
        });

        var y_scale = d3.scale.linear()
          .domain([0, d3.max(data_, function(d) { return d.value; })])
          .range([height, 0]);

        var barWidth = width / data_.length;

        var bar = graph.selectAll('g')
          .data(data_)
          .enter().append('g')
          .attr('transform', function(d, i) { return 'translate(' + (i * barWidth) + ', 0)'; });

        bar.append('svg:rect')
          .attr('class', 'bar')
          .attr('y', function(d) { return y_scale(d.value); })
          .attr('height', function(d) { return height - y_scale(d.value); })
          .attr('width', barWidth - 1);

        var data_gain_ = [
          {
            year: 2001,
            value: gain
          },
          {
            year: 2012,
            value: gain
          }
        ];

        graph.selectAll('line.minioverview_line')
          .data(data_gain_)
          .enter()
          .append('line')
          .attr({
            'class': 'minioverview_line',
            'x1': 0,
            'x2': width,
            'y1': function(d) { return y_scale(gain); },
            'y2': function(d) { return y_scale(gain); }
          });
      });
    } else if (this.model.get('graph') === ('percent_loss')) {
      var sql = 'WITH loss as (SELECT ';

      for(var y = 2001; y < 2012; y++) {
        sql += 'y'+y+' as loss_y'+y+', ';
      }

      sql += "y2012 as loss_y2012\
              FROM loss_gt_25\
              WHERE iso = '"+iso+"'), extent as (SELECT ";

      for(var y = 2001; y < 2012; y++) {
        sql += 'y'+y+' as extent_y'+y+', ';
      }

      sql += "y2012 as extent_y2012\
              FROM extent_gt_25\
              WHERE iso = '"+iso+"')";

      sql += 'SELECT ';

      for(var y = 2001; y < 2012; y++) {
        sql += 'loss_y'+y+'/extent_y'+y+' as percent_'+y+', ';
      }

      sql += 'loss_y2012/extent_y2012 as percent_2012\
              FROM loss, extent';

      d3.json('https://wri-01.cartodb.com/api/v2/sql?q='+encodeURIComponent(sql), function(json) {
        var data = json.rows[0];

        var data_ = [];

        _.each(data, function(val, key) {
          data_.push({
            'year': key.replace('y',''),
            'value': val*100
          });
        });

        var y_scale = d3.scale.linear()
          .domain([0, d3.max(data_, function(d) { return d.value; })])
          .range([height, 0]);

        var barWidth = width / data_.length;

        var bar = graph.selectAll('g')
          .data(data_)
          .enter().append('g')
          .attr('transform', function(d, i) { return 'translate(' + (i * barWidth) + ', 0)'; });

        bar.append('svg:rect')
          .attr('class', 'bar')
          .attr('y', function(d) { return y_scale(d.value); })
          .attr('height', function(d) { return height - y_scale(d.value); })
          .attr('width', barWidth - 1);

      });
    } else if (this.model.get('graph') === ('total_extent')) {
      var sql = 'SELECT ';

      for(var y = 2001; y < 2012; y++) {
        sql += 'loss.y'+y+' as loss_y'+y+', ';
      }

      sql += 'loss.y2012 as loss_y2012, ';

      for(var y = 2001; y < 2012; y++) {
        sql += 'extent.y'+y+' as extent_y'+y+', ';
      }

      sql += "extent.y2012 as extent_y2012\
              FROM loss_gt_0 loss, extent_gt_25 extent\
              WHERE loss.iso = extent.iso\
              AND loss.iso = '"+iso+"'";

      d3.json('https://wri-01.cartodb.com/api/v2/sql?q='+sql, function(json) {

        var graph2 = d3.select('.countries_list__minioverview_'+iso)
          .append('div')
          .attr('class', 'sibling')
          .append('svg:svg')
          .attr('width', width)
          .attr('height', height);

        var data = json.rows[0];

        var data_loss_ = [],
            data_extent_ = [];

        _.each(data, function(val, key) {
          if (key.indexOf('loss_y') != -1) {
            data_loss_.push({
              'year': key.split('_y')[1],
              'value': val
            });
          }

          if (key.indexOf('extent_y') != -1) {
            data_extent_.push({
              'year': key.split('extent_y')[1],
              'value': val
            });
          }
        });

        var y_scale_loss = d3.scale.linear()
          .domain([0, d3.max(data_loss_, function(d) { return d.value; })])
          .range([height, 0]);

        var y_scale_extent = d3.scale.linear()
          .domain([0, d3.max(data_extent_, function(d) { return d.value; })])
          .range([height, 0]);

        var barWidth_loss = width / data_loss_.length;

        var bar = graph.selectAll('g')
          .data(data_loss_)
          .enter()
          .append('g')
          .attr('transform', function(d, i) { return 'translate(' + (i * barWidth_loss) + ', 0)'; });

        bar.append('svg:rect')
          .attr('class', 'bar')
          .attr('y', function(d) { return y_scale_loss(d.value); })
          .attr('height', function(d) { return height - y_scale_loss(d.value); })
          .attr('width', barWidth_loss - 1);

        var barWidth_extent = width / data_extent_.length;

        var bar2 = graph2.selectAll('g')
          .data(data_extent_)
          .enter()
          .append('g')
          .attr('transform', function(d, i) { return 'translate(' + (i * barWidth_extent) + ', 0)'; });

        bar2.append('svg:rect')
          .attr('class', 'bar extent')
          .attr('y', function(d) { return y_scale_extent(d.value); })
          .attr('height', function(d) { return height - y_scale_extent(d.value); })
          .attr('width', barWidth_extent - 1);
      });
    }
  },

  _drawYears: function() {
    var markup_years = '';

    for (var y = 2001; y<=2012; y += 1) {
      var y_ = this.x_scale(y);

      if (y === 2001) {
        y_ -= 25;
      } else if (y === 2012) {
        y_ -= 55;
      } else {
        y_ -= 40;
      }

      markup_years += '<span class="year" style="left:'+y_+'px">'+y+'</span>';
    }

    this.$years.html(markup_years);
  },

  _drawGraph: function() {
    var that = this;

    var w = this.w,
        h = this.h,
        vertical_m = this.vertical_m,
        m = this.m,
        x_scale = this.x_scale;

        thresh = config.canopy_choice || 10;

    var grid_scale = d3.scale.linear()
      .range([vertical_m, h-vertical_m])
      .domain([1, 0]);

    d3.select('#chart').remove();

    var svg = d3.select('.overview_graph__area')
      .append('svg:svg')
      .attr('id', 'chart')
      .attr('width', w)
      .attr('height', h);

    // grid
    svg.selectAll('line.grid_h')
      .data(grid_scale.ticks(4))
      .enter()
      .append('line')
      .attr({
        'class': 'grid grid_h',
        'x1': 0,
        'x2': w,
        'y1': function(d, i) { return grid_scale(d); },
        'y2': function(d, i) { return grid_scale(d); }
      });

    svg.selectAll('line.grid_v')
      .data(x_scale.ticks(12))
      .enter()
      .append('line')
      .attr({
        'class': 'grid grid_v',
        'y1': h,
        'y2': 0,
        'x1': function(d) { return x_scale(d); },
        'x2': function(d) { return x_scale(d); }
      });

    var gradient = svg.append('svg:defs')
      .append('svg:linearGradient')
      .attr('id', 'gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%')
      .attr('spreadMethod', 'pad');

    gradient.append('svg:stop')
      .attr('offset', '0%')
      .attr('stop-color', '#CA46FF')
      .attr('stop-opacity', .5);

    gradient.append('svg:stop')
      .attr('offset', '100%')
      .attr('stop-color', '#D24DFF')
      .attr('stop-opacity', 1);

    if (this.model.get('graph') === 'total_loss') {
      this._showYears();

      svg.append('text')
        .attr('class', 'axis')
        .attr('id', 'axis_y')
        .text('Mha')
        .attr('x', -h/2)
        .attr('y', 30)
        .attr('transform', 'rotate(-90)');

      var sql = 'SELECT ';
      for(var y = 2001; y < 2012; y++) {
        sql += '(SELECT sum(loss) FROM umd_nat WHERE year ='+y+' AND thresh ='+thresh+' ) as y'+y+',';
      }

      sql += '(SELECT sum(loss) FROM umd_nat WHERE year = 2012 AND thresh ='+thresh+' ) as y2012, (SELECT SUM(y2001_y2012) FROM countries_gain) as gain';
      d3.json('https://wri-01.cartodb.com/api/v2/sql?q='+sql, function(error, json) {
        var data = json.rows[0];

        var data_ = [],
            gain = null;

        _.each(data, function(val, key) {
          if (key === 'gain') {
            gain = val/12;
          } else {
            data_.push({
              'year': key.replace('y',''),
              'value': val
            });
          }
        });

        var y_scale = d3.scale.linear()
          .range([vertical_m, h-vertical_m])
          .domain([d3.max(data_, function(d) { return d.value; }), 0]);

        // area
        var area = d3.svg.area()
          .x(function(d) { return x_scale(d.year); })
          .y0(h)
          .y1(function(d) { return y_scale(d.value); });

        svg.append('path')
          .datum(data_)
          .attr('class', 'area')
          .attr('d', area)
          .style('fill', 'url(#gradient)');

        // circles
        svg.selectAll('circle')
          .data(data_)
          .enter()
          .append('svg:circle')
          .attr('class', 'linedot')
          .attr('cx', function(d) {
            return x_scale(d.year);
          })
          .attr('cy', function(d){
            return y_scale(d.value);
          })
          .attr('r', 6)
          .attr('name', function(d) {
            return '<span>'+d.year+'</span>'+formatNumber(parseFloat(d.value/1000000).toFixed(1))+' Mha';
          })
          .on('mouseover', function(d) {
            that.tooltip.html($(this).attr('name'))
              .style('visibility', 'visible')
              .style('top', $(this).offset().top-100+'px')
              .style('left', $(this).offset().left-$('.tooltip').width()/2-4+'px')
              .attr('class', 'tooltip');

            d3.select(this)
              .transition()
              .duration(100)
              .attr('r', 7);

            // TODO: highlighting the legend
          })
          .on('mouseout', function(d) {
            that.tooltip.style('visibility', 'hidden');

            d3.select(this)
              .transition()
              .duration(100)
              .attr('r', 6);

            // TODO: highlighting the legend
          });

        var data_gain_ = [
          {
            year: 2001,
            value: gain
          },
          {
            year: 2012,
            value: gain
          }
        ];

        // line
        svg.selectAll('line.overview_line')
          .data([data_gain_[0]])
          .enter()
          .append('line')
          .attr({
            'class': 'overview_line',
            'x1': m,
            'x2': w-m,
            'y1': function(d) { return y_scale(gain); },
            'y2': function(d) { return y_scale(gain); }
          });

        svg.selectAll('circle.gain')
          .data(data_gain_)
          .enter()
          .append('svg:circle')
          .attr('class', 'linedot gain')
          .attr('cx', function(d) {
            return x_scale(d.year);
          })
          .attr('cy', function(d){
            return y_scale(d.value);
          })
          .attr('r', 6)
          .attr('name', function(d) {
            return '<span>2001-2012</span>'+formatNumber(parseFloat(d.value/1000000).toFixed(1))+' Mha';
          })
          .on('mouseover', function(d) {
            that.tooltip.html($(this).attr('name'))
              .style('visibility', 'visible')
              .style('top', $(this).offset().top-100+'px')
              .style('left', $(this).offset().left-$('.tooltip').width()/2-4+'px')
              .attr('class', 'tooltip gain_tooltip');

            d3.select(this)
              .transition()
              .duration(100)
              .attr('r', 7);

            // TODO: highlighting the legend
          })
          .on('mouseout', function(d) {
            that.tooltip.style('visibility', 'hidden');

            d3.select(this)
              .transition()
              .duration(100)
              .attr('r', 6);

            // TODO: highlighting the legend
          });
      });
    } else if (this.model.get('graph') === 'percent_loss') {
      this._showYears();

      svg.append('text')
        .attr('class', 'axis')
        .attr('id', 'axis_y')
        .text('%')
        .attr('x', -h/2)
        .attr('y', 30)
        .attr('transform', 'rotate(-90)');

      var sql = 'WITH loss as (SELECT ';

      for(var y = 2001; y < 2012; y++) {
        sql += '(SELECT sum(loss) FROM umd_nat WHERE year ='+y+' AND thresh ='+thresh+' ) as sum_loss_y'+y+',';
      }
      sql += '(SELECT sum(loss) FROM umd_nat WHERE year = 2012 AND thresh ='+thresh+' ) as sum_loss_y2012), extent as (SELECT ';

      for(var y = 2001; y < 2012; y++) {
        sql += '(SELECT sum(extent) FROM umd_nat WHERE year ='+y+' AND thresh ='+thresh+' ) as sum_extent_y'+y+',';
      }
      sql += '(SELECT sum(extent) FROM umd_nat WHERE year = 2012 AND thresh ='+thresh+' ) as sum_extent_y2012) SELECT ';

      for(var y = 2001; y < 2012; y++) {
        sql += 'sum_loss_y'+y+'/sum_extent_y'+y+' as percent_loss_'+y+', ';
      }

      sql += 'sum_loss_y2012/sum_extent_y2012 as percent_loss_2012, (SELECT SUM(y2001_y2012)/(';

      for(var y = 2001; y < 2012; y++) {
        sql += 'sum_extent_y'+y+' + ';
      }

      sql += 'sum_extent_y2012)\
              FROM countries_gain) as gain\
              FROM loss, extent';

      d3.json('https://wri-01.cartodb.com/api/v2/sql?q='+encodeURIComponent(sql), function(json) {
        var data = json.rows[0];

        var data_ = [],
            gain = null;

        _.each(data, function(val, key) {
          if (key === 'gain') {
            gain = val/12;
          } else {
            data_.push({
              'year': key.replace('percent_loss_',''),
              'value': val
            });
          }
        });

        var y_scale = grid_scale;

        // area
        var area = d3.svg.area()
          .x(function(d) { return x_scale(d.year); })
          .y0(h)
          .y1(function(d) { return y_scale(d.value*100); });

        svg.append('path')
          .datum(data_)
          .attr('class', 'area')
          .attr('d', area)
          .style('fill', 'url(#gradient)');

        // circles
        svg.selectAll('circle')
          .data(data_)
          .enter()
          .append('svg:circle')
          .attr('class', 'linedot')
          .attr('cx', function(d) {
            return x_scale(d.year);
          })
          .attr('cy', function(d){
            return y_scale(d.value*100);
          })
          .attr('r', 6)
          .attr('name', function(d) {
            return '<span>'+d.year+'</span>'+parseFloat(d.value*100).toFixed(2)+' %';
          })
          .on('mouseover', function(d) {
            that.tooltip.html($(this).attr('name'))
              .style('visibility', 'visible')
              .style('top', $(this).offset().top-100+'px')
              .style('left', $(this).offset().left-$('.tooltip').width()/2-4+'px')
              .attr('class', 'tooltip');

            d3.select(this)
              .transition()
              .duration(100)
              .attr('r', 7);

            // TODO: highlighting the legend
          })
          .on('mouseout', function(d) {
            that.tooltip.style('visibility', 'hidden');

            d3.select(this)
              .transition()
              .duration(100)
              .attr('r', 6);

            // TODO: highlighting the legend
          });

        var data_gain_ = [
          {
            year: 2001,
            value: gain
          },
          {
            year: 2012,
            value: gain
          }
        ];

        // line
        svg.selectAll('line.overview_line')
          .data([data_gain_[0]])
          .enter()
          .append('line')
          .attr({
            'class': 'overview_line',
            'x1': m,
            'x2': w-m,
            'y1': function(d) { return y_scale(gain*100); },
            'y2': function(d) { return y_scale(gain*100); }
          });

         // circles
        svg.selectAll('circle.gain')
          .data(data_gain_)
          .enter()
          .append('svg:circle')
          .attr('class', 'linedot gain')
          .attr('cx', function(d) {
            return x_scale(d.year);
          })
          .attr('cy', function(d){
            return y_scale(d.value*100);
          })
          .attr('r', 6)
          .attr('name', function(d) {
            return '<span>2001-2012</span>'+parseFloat(d.value*100).toFixed(2)+' %';
          })
          .on('mouseover', function(d) {
            that.tooltip.html($(this).attr('name'))
              .style('visibility', 'visible')
              .style('top', $(this).offset().top-100+'px')
              .style('left', $(this).offset().left-$('.tooltip').width()/2-4+'px')
              .attr('class', 'tooltip gain_tooltip');

            d3.select(this)
              .transition()
              .duration(100)
              .attr('r', 7);

            // TODO: highlighting the legend
          })
          .on('mouseout', function(d) {
            that.tooltip.style('visibility', 'hidden');

            d3.select(this)
              .transition()
              .duration(100)
              .attr('r', 6);

            // TODO: highlighting the legend
          });
      });
    } else if (this.model.get('graph') === 'total_extent') {
      this._showYears();

      svg.append('text')
        .attr('class', 'axis')
        .attr('id', 'axis_y')
        .text('Mha')
        .attr('x', -h/2)
        .attr('y', 30)
        .attr('transform', 'rotate(-90)');

      var gradient_extent = svg.append('svg:defs')
        .append('svg:linearGradient')
        .attr('id', 'gradient_extent')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%')
        .attr('spreadMethod', 'pad');

      gradient_extent.append('svg:stop')
        .attr('offset', '0%')
        .attr('stop-color', '#98BD17')
        .attr('stop-opacity', .5);

      gradient_extent.append('svg:stop')
        .attr('offset', '100%')
        .attr('stop-color', '#98BD17')
        .attr('stop-opacity', 1);

      var sql = 'SELECT ';

      for(var y = 2001; y < 2012; y++) {
        sql += '(SELECT sum(loss) FROM umd_nat WHERE year ='+y+' AND thresh ='+thresh+' ) as loss_y'+y+',';
      }

      sql += '(SELECT sum(loss) FROM umd_nat WHERE year = 2012 AND thresh ='+thresh+' ) as loss_y'+y+',';

      for(var y = 2001; y < 2012; y++) {
        sql += '(SELECT sum(extent) FROM umd_nat WHERE year ='+y+' AND thresh ='+thresh+' ) as extent_y'+y+',';
      }

      sql += '(SELECT sum(extent) FROM umd_nat WHERE year = 2012 AND thresh ='+thresh+' ) as extent_y'+y+' FROM umd_nat';

      d3.json('https://wri-01.cartodb.com/api/v2/sql?q='+encodeURIComponent(sql), function(json) {
        var data = json.rows[0];

        var data_ = [],
            data_loss_ = [],
            data_extent_ = [];

        _.each(data, function(val, key) {
          var year = key.split('_y')[1];

          var obj = _.find(data_, function(obj) { return obj.year == year; });

          if (obj === undefined) {
            data_.push({ 'year': year });
          }

          if (key.indexOf('loss_y') != -1) {
            data_loss_.push({
              'year': key.split('_y')[1],
              'value': val
            });
          }

          if (key.indexOf('extent_y') != -1) {
            data_extent_.push({
              'year': key.split('extent_y')[1],
              'value': val
            });
          }
        });

        _.each(data_, function(val) {
          var loss = _.find(data_loss_, function(obj) { return obj.year == val.year; }),
              extent = _.find(data_extent_, function(obj) { return obj.year == val.year; });

          _.extend(val, { 'loss': loss.value, 'extent': extent.value });
        });

        var domain = [d3.max(data_, function(d) { return d.extent; }), 0];

        var y_scale = d3.scale.linear()
          .range([vertical_m, h-vertical_m])
          .domain(domain);

        // area
        var area_loss = d3.svg.area()
          .x(function(d) { return x_scale(d.year); })
          .y0(h)
          .y1(function(d) { return y_scale(d.loss); });

        var area_extent = d3.svg.area()
          .x(function(d) { return x_scale(d.year); })
          .y0(function(d) { return y_scale(d.extent); })
          .y1(function(d) { return y_scale(d.loss); });

        svg.append('path')
          .datum(data_)
          .attr('class', 'area')
          .attr('d', area_loss)
          .style('fill', 'url(#gradient)');

        svg.append('path')
          .datum(data_)
          .attr('class', 'area')
          .attr('d', area_extent)
          .style('fill', 'url(#gradient_extent)');

        // circles
        svg.selectAll('circle')
          .data(data_loss_)
          .enter()
          .append('svg:circle')
          .attr('class', 'linedot')
          .attr('cx', function(d) {
            return x_scale(d.year);
          })
          .attr('cy', function(d){
            return y_scale(d.value);
          })
          .attr('r', 6)
          .attr('name', function(d) {
            return '<span>'+d.year+'</span>'+formatNumber(parseFloat(d.value/1000000).toFixed(1))+' Mha';
          })
          .on('mouseover', function(d) {
            that.tooltip.html($(this).attr('name'))
              .style('visibility', 'visible')
              .style('top', $(this).offset().top-100+'px')
              .style('left', $(this).offset().left-$('.tooltip').width()/2-4+'px')
              .attr('class', 'tooltip');

            d3.select(this)
              .transition()
              .duration(100)
              .attr('r', 7);

            // TODO: highlighting the legend
          })
          .on('mouseout', function(d) {
            that.tooltip.style('visibility', 'hidden');

            d3.select(this)
              .transition()
              .duration(100)
              .attr('r', 6);

            // TODO: highlighting the legend
          });

        svg.selectAll('circle.gain')
          .data(data_extent_)
          .enter()
          .append('svg:circle')
          .attr('class', 'linedot gain')
          .attr('cx', function(d) {
            return x_scale(d.year);
          })
          .attr('cy', function(d){
            return y_scale(d.value);
          })
          .attr('r', 6)
          .attr('name', function(d) {
            return '<span>'+d.year+'</span>'+formatNumber(parseFloat(d.value/1000000).toFixed(1))+' Mha';
          })
          .on('mouseover', function(d) {
            that.tooltip.html($(this).attr('name'))
              .style('visibility', 'visible')
              .style('top', $(this).offset().top-100+'px')
              .style('left', $(this).offset().left-$('.tooltip').width()/2-4+'px')
              .attr('class', 'tooltip gain_tooltip');

            d3.select(this)
              .transition()
              .duration(100)
              .attr('r', 7);

            // TODO: highlighting the legend
          })
          .on('mouseout', function(d) {
            that.tooltip.style('visibility', 'hidden');

            d3.select(this)
              .transition()
              .duration(100)
              .attr('r', 6);

            // TODO: highlighting the legend
          });
      });
    } else if (this.model.get('graph') === 'ratio') {
      this._hideYears();

      svg.append('text')
        .attr('class', 'axis light')
        .attr('id', 'axis_y')
        .text('Ratio of tree cover loss to gain 2001-2012')
        .attr('x', -(h/2)-60)
        .attr('y', 30)
        .attr('transform', 'rotate(-90)');

      svg.append('text')
        .attr('class', 'axis light')
        .attr('id', 'axis_ratio')
        .text('1')
        .attr('x', 25)
        .attr('y', h-60);

      var shadow = svg.append('svg:defs')
        .append('svg:filter')
        .attr('id', 'shadow')
        .attr('x', '0%')
        .attr('y', '0%')
        .attr('width', '200%')
        .attr('height', '200%');

      shadow.append('svg:feOffset')
        .attr('result', 'offOut')
        .attr('in', 'SourceAlpha')
        .attr('dx', 0)
        .attr('dy', 0);

      shadow.append('svg:feGaussianBlur')
        .attr('result', 'blurOut')
        .attr('in', 'offOut')
        .attr('stdDeviation', 1);

      shadow.append('svg:feBlend')
        .attr('in', 'SourceGraphic')
        .attr('in2', 'blurOut')
        .attr('mode', 'normal');

      var sql = 'WITH loss as (SELECT iso, SUM(';

      for(var y = 2001; y < 2012; y++) {
        sql += 'loss.y'+y+' + ';
      }

      sql += ['loss.y2012) as sum_loss',
              'FROM loss_gt_50 loss',
              'GROUP BY iso), gain as ('].join(' ');

      sql += ['SELECT g.iso, SUM(y2001_y2012) as sum_gain',
              'FROM countries_gain g, loss_gt_50 loss',
              'WHERE loss.iso = g.iso',
              'GROUP BY g.iso), ratio as ('].join(' ');

      sql += ['SELECT c.iso, c.name, c.enabled, loss.sum_loss as loss,',
                     'gain.sum_gain as gain, loss.sum_loss/gain.sum_gain as ratio',
              'FROM loss, gain, gfw2_countries c',
              'WHERE sum_gain IS NOT null',
              'AND NOT sum_gain = 0',
              'AND c.iso = gain.iso',
              'AND c.iso = loss.iso',
              'ORDER BY loss.sum_loss DESC',
              'LIMIT 50), extent as ('].join(' ');

      sql += ['SELECT extent.iso, SUM(extent.y2012) as extent',
              'FROM countries_extent extent',
              'GROUP BY extent.iso) '].join(' ');

      sql += ['SELECT *',
              'FROM ratio, extent',
              'WHERE ratio IS NOT null',
              'AND extent.iso = ratio.iso'].join(' ');

      d3.json('https://wri-01.cartodb.com/api/v2/sql?q='+encodeURIComponent(sql), function(json) {
        var data = json.rows;

        var log_m = 50;

        var x_log_scale = d3.scale.log()
          .range([m, w-m])
          .domain([d3.min(data, function(d) { return d.extent; }), d3.max(data, function(d) { return d.extent; })]);

        var y_log_scale = d3.scale.log()
          .range([h-log_m, m])
          .domain([d3.min(data, function(d) { return d.ratio; }), d3.max(data, function(d) { return d.ratio; })]);

        var color_scale = d3.scale.linear()
          .domain([d3.min(data, function(d) { return d.ratio; }), 1, 10, d3.max(data, function(d) { return d.ratio; })])
          .range(["#9ABF00", "#9ABF00", "#CA46FF", "#CA46FF"]);

        // line
        svg.selectAll('line.linear_regression')
          .data([1])
          .enter()
          .append('line')
          .attr({
            'class': 'linear_regression',
            'x1': m,
            'x2': w-m,
            'y1': function(d) { return y_log_scale(d); },
            'y2': function(d) { return y_log_scale(d); },
            "stroke-width": 1.3,
            "stroke": "white",
            "stroke-dasharray": "7,5"
          });

        // circles w/ magic numbers :(
        var circle_attr = {
          'cx': function(d) { return x_log_scale(d.extent) },
          'cy': function(d) { return y_log_scale(d.ratio) },
          'r': 5,
          'name': function(d) { return d.name; },
          'class': function(d) { return d.enabled ? 'ball ball_link' : 'ball ball_nolink'; }
        };

        var data_ = [],
            data_link_ = [],
            exclude = [];

        _.each(data, function(row) {
          if (!_.contains(exclude, row.name)) {
            if (row.enabled === true) {
              data_link_.push(row);
            } else {
              data_.push(row);
            }
          }
        });

        var circles_link = svg.selectAll('circle.ball_link')
          .data(data_link_)
          .enter()
          .append('a')
          .attr('xlink:href', function(d) { return '/country/' + d.iso})
          .append('svg:circle')
          .attr(circle_attr)
          .style('fill', function(d) {
            return color_scale(d.ratio);
          })
          .style('filter', 'url(#shadow)')
          .on('mouseover', function() {
            d3.select(d3.event.target)
              .transition()
              .attr('r', 7)
              .style('opacity', 1);

            var t = $(this).offset().top - 80,
                l = $(this).offset().left,
                r = $(this).attr('r'),
                tip = $('.tooltip').width()/2;

            that.tooltip.html($(this).attr('name'))
              .style('visibility', 'visible')
              .style('top', parseInt(t, 10)+'px')
              .style('left', parseInt(l, 10)+parseInt(r, 10)-parseInt(tip, 10)-10+'px')
              .attr('class', 'tooltip gain_tooltip');
          })
          .on('mouseenter', function() {
            d3.select(d3.event.target)
              .transition()
              .attr('r', 7)
              .style('opacity', 1);

            var t = $(this).offset().top - 80,
                l = $(this).offset().left,
                r = $(this).attr('r'),
                tip = $('.tooltip').width()/2;

            that.tooltip.html($(this).attr('name'))
              .style('visibility', 'visible')
              .style('top', parseInt(t, 10)+'px')
              .style('left', parseInt(l, 10)+parseInt(r, 10)-parseInt(tip, 10)+'px')
              .attr('class', 'tooltip gain_tooltip');
          })
          .on('mouseout', function() {
            d3.select(d3.event.target)
              .transition()
              .attr('r', 5)
              .style('opacity', .8);

            that.tooltip.style('visibility', 'hidden');
          });

        var circles = svg.selectAll('circle.ball_nolink')
          .data(data_)
          .enter()
          .append('svg:circle')
          .attr(circle_attr)
          .style('fill', function(d) {
            return color_scale(d.ratio);
          })
          .style('filter', 'url(#shadow)')
          .on('mouseover', function() {
            d3.select(d3.event.target)
              .transition()
              .attr('r', 7)
              .style('opacity', 1);

            var t = $(this).offset().top - 80,
                l = $(this).offset().left,
                r = $(this).attr('r'),
                tip = $('.tooltip').width()/2;

            that.tooltip.html($(this).attr('name'))
              .style('visibility', 'visible')
              .style('top', parseInt(t, 10)+'px')
              .style('left', parseInt(l, 10)+parseInt(r, 10)-parseInt(tip, 10)-10+'px')
              .attr('class', 'tooltip gain_tooltip');
          })
          .on('mouseenter', function() {
            d3.select(d3.event.target)
              .transition()
              .attr('r', 7)
              .style('opacity', 1);

            var t = $(this).offset().top - 80,
                l = $(this).offset().left,
                r = $(this).attr('r'),
                tip = $('.tooltip').width()/2;

            that.tooltip.html($(this).attr('name'))
              .style('visibility', 'visible')
              .style('top', parseInt(t, 10)+'px')
              .style('left', parseInt(l, 10)+parseInt(r, 10)-parseInt(tip, 10)+'px')
              .attr('class', 'tooltip gain_tooltip');
          })
          .on('mouseout', function() {
            d3.select(d3.event.target)
              .transition()
              .attr('r', 5)
              .style('opacity', .8);

            that.tooltip.style('visibility', 'hidden');
          });
      });
    } else if (this.model.get('graph') === 'domains') {
      this._showYears();

      var sql = 'SELECT name, ';

      for(var y = 2001; y < 2012; y++) {
        sql += 'y'+y+', '
      }

      sql += 'y2012, GREATEST('

      for(var y = 2001; y < 2012; y++) {
        sql += 'y'+y+', '
      }

      sql += 'y2012) as max\
              FROM countries_domains';

      d3.json('https://wri-01.cartodb.com/api/v2/sql?q='+sql, function(error, json) {
        var data = json.rows;

        var r_scale = d3.scale.linear()
          .range([5, 30]) // max ball radius
          .domain([0, d3.max(data, function(d) { return d.max; })])

        for(var j = 0; j < data.length; j++) {
          var data_ = [],
              domain = '';

          _.each(data[j], function(val, key) {
            if (key !== 'max') {
              if (key === 'name') {
                domain = val.toLowerCase();
              } else {
                data_.push({
                  'year': key.replace('y',''),
                  'value': val
                });
              }
            }
          });

          svg.append('text')
            .attr('class', 'label')
            .attr('id', 'label_'+domain)
            .text(domain)
            .attr('x', function() {
              var l = x_scale(2002) - $(this).width()/2;

              return l;
            })
            .attr('y', (h/5)*(j+.6));

          var circle_attr = {
            'cx': function(d, i) { return x_scale(2001 + i); },
            'cy': function(d) { return (h/5)*(j+1); },
            'r': function(d) { return r_scale(d.value); },
            'class': function(d) { return 'ball'; }
          };

          svg.selectAll('circle.domain_'+domain)
            .data(data_)
            .enter()
            .append('svg:circle')
            .attr(circle_attr)
            .attr('data-slug', domain)
            .attr('name', function(d) {
              return '<span>'+d.year+'</span>'+formatNumber(parseFloat(d.value/1000000).toFixed(1))+' Mha';
            })
            .style('fill', function(d) { return config.GRAPHCOLORS[domain]; })
            .on('mouseover', function() {
              d3.select(d3.event.target)
                .transition()
                .attr('r', function(d) { return circle_attr.r(d) + 2; })
                .style('opacity', 1);

              var t = $(this).offset().top - 100,
                  l = $(this).offset().left,
                  r = $(this).attr('r'),
                  tip = $('.tooltip').width()/2,
                  slug = $(this).attr('data-slug');

              that.tooltip.html($(this).attr('name'))
                .style('visibility', 'visible')
                .style('top', parseInt(t, 10)+'px')
                .style('left', parseInt(l, 10)+parseInt(r, 10)-parseInt(tip, 10)-10+'px')
                .attr('class', 'tooltip')
                .attr('data-slug', 'tooltip')
                .style('color', function() {
                  if (slug === 'subtropical') {
                    return '#FFC926'
                  } else {
                    return config.GRAPHCOLORS[slug];
                  }
                });
            })
            .on('mouseenter', function() {
              d3.select(d3.event.target)
                .transition()
                .attr('r', function(d) { return circle_attr.r(d) + 2; })
                .style('opacity', 1);

              var t = $(this).offset().top - 80,
                  l = $(this).offset().left,
                  r = $(this).attr('r'),
                  tip = $('.tooltip').width()/2,
                  slug = $(this).attr('data-slug');

              that.tooltip.html($(this).attr('name'))
                .style('visibility', 'visible')
                .style('top', parseInt(t, 10)+'px')
                .style('left', parseInt(l, 10)+parseInt(r, 10)-parseInt(tip, 10)-10+'px')
                .attr('class', 'tooltip')
                .attr('data-slug', 'tooltip')
                .style('color', function() {
                  if (domain === 'subtropical') { return config.GRAPHCOLORS[domain]; }
                });
            })
            .on('mouseout', function() {
              d3.select(d3.event.target)
                .transition()
                .attr('r', function(d) { return circle_attr.r(d); })
                .style('opacity', .8);

              that.tooltip
                .style('color', '')
                .style('visibility', 'hidden');
            });
        }
      });
    }
  }
});
