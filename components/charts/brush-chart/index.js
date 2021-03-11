import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';

import { scaleLinear } from 'd3-scale';

import { Spring } from 'react-spring/renderprops.cjs';

import ComposedChart from 'components/charts/composed-chart';
import SVGBrush from './svg-brush';

import './styles.scss';

export default class Brush extends PureComponent {
  static propTypes = {
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    startIndex: PropTypes.number,
    endIndex: PropTypes.number,
    margin: PropTypes.object,
    data: PropTypes.array,
    config: PropTypes.object,
    minimumGap: PropTypes.number,
    maximumGap: PropTypes.number,
    onBrushEnd: PropTypes.func,
  };

  static defaultProps = {
    margin: {
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    },
    minimumGap: 0,
    maximumGap: 0,
  };

  state = {
    ready: false,
    brushSelection: null,
    intermediateBrushSelection: null,
  };

  componentDidMount() {
    const { margin, data, startIndex, endIndex } = this.props;

    if (!data) return;

    const { width, height } = this.svg.getBoundingClientRect();

    this.scale = scaleLinear()
      .domain([0, data.length - 1])
      .rangeRound([margin.left, width - margin.right]);

    const start = startIndex || 0;
    const end = endIndex || data.length - 1;

    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({
      ready: true,
      brushSelection: [
        [this.scale(start), margin.top],
        [this.scale(end), height - margin.bottom],
      ],
    });
  }

  componentDidUpdate(prevProps) {
    const { margin, startIndex, endIndex, data } = this.props;
    const { height, width } = this.svg.getBoundingClientRect();
    const {
      startIndex: prevStartIndex,
      endIndex: prevEndIndex,
      data: prevData,
    } = prevProps;

    if (!isEqual(data, prevData)) {
      this.scale = scaleLinear()
        .domain([0, data.length - 1])
        .rangeRound([margin.left, width - margin.right]);
    }

    if (startIndex !== prevStartIndex || endIndex !== prevEndIndex) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        brushSelection: [
          [this.scale(startIndex), margin.top],
          [this.scale(endIndex), height - margin.bottom],
        ],
      });
    }
  }

  _renderBackground() {
    const { margin } = this.props;
    const { width, height } = this.svg.getBoundingClientRect();

    return (
      <React.Fragment>
        <rect
          x={margin.left}
          y={margin.top}
          width={width - margin.left - margin.right}
          height={height - margin.bottom - margin.top}
          fill="#FFF"
          fillOpacity="0"
        />
      </React.Fragment>
    );
  }

  _renderAxis() {
    const { margin, data } = this.props;
    const { height } = this.svg.getBoundingClientRect();

    const min = {
      id: 'min',
      x: this.scale(0),
      y: height - margin.bottom + 4,
      value: data[0].date,
      textAnchor: 'start',
    };
    const max = {
      id: 'max',
      x: this.scale(data.length - 1),
      y: height - margin.bottom + 4,
      value: data[data.length - 1].date,
      textAnchor: 'end',
    };

    return (
      <React.Fragment>
        {[max, min].map((t) => {
          const { id, x, y, value, textAnchor } = t;
          return (
            <React.Fragment key={id}>
              <text
                key={`label${id}`}
                x={x}
                y={y}
                dominantBaseline="hanging"
                fontSize={10}
                textAnchor={textAnchor}
              >
                {value}
              </text>
            </React.Fragment>
          );
        })}
      </React.Fragment>
    );
  }

  _renderBrush() {
    const { width, height } = this.svg.getBoundingClientRect();
    const { margin, maximumGap, minimumGap, onBrushEnd } = this.props;
    const { brushSelection, intermediateBrushSelection } = this.state;
    const fs = intermediateBrushSelection || brushSelection;
    const ts = brushSelection;
    const [[fx0, fy0], [fx1, fy1]] = fs || [
      [0, 0],
      [0, 0],
    ];
    const [[tx0, ty0], [tx1, ty1]] = ts || [
      [0, 0],
      [0, 0],
    ];

    return (
      <Spring
        from={{ x0: fx0, y0: fy0, x1: fx1, y1: fy1 }}
        to={{ x0: tx0, y0: ty0, x1: tx1, y1: ty1 }}
        immediate={!intermediateBrushSelection}
      >
        {(props) => (
          <SVGBrush
            scale={this.scale}
            minimumGap={minimumGap}
            maximumGap={maximumGap}
            extent={[
              [margin.left, margin.top],
              [width - margin.right, height - margin.bottom],
            ]}
            getEventMouse={(event) => {
              const { clientX, clientY } = event;
              const { left, top } = this.svg.getBoundingClientRect();
              return [clientX - left, clientY - top];
            }}
            brushType="x"
            selection={
              brushSelection && [
                [props.x0, props.y0],
                [props.x1, props.y1],
              ]
            }
            onBrush={({ selection }) => {
              this.setState({
                brushSelection: selection,
                intermediateBrushSelection: null,
              });
            }}
            onBrushEnd={({ selection }) => {
              if (!selection) {
                this.setState({
                  brushSelection: null,
                  intermediateBrushSelection: null,
                });
                return;
              }

              const [[x0, y0], [x1, y1]] = selection;
              const [rx0, rx1] = [x0, x1].map((d) =>
                Math.round(this.scale.invert(d))
              );

              this.setState({
                brushSelection: [
                  [x0, y0],
                  [x1, y1],
                ],
                intermediateBrushSelection: [
                  [x0, y0],
                  [x1, y1],
                ],
              });

              if (onBrushEnd) {
                onBrushEnd({
                  startIndex: rx0,
                  endIndex: rx1,
                });
              }
            }}
          />
        )}
      </Spring>
    );
  }

  render() {
    const { data, config, width, height } = this.props;
    const { ready } = this.state;

    return (
      <div className="c-brush">
        <ComposedChart className="brush--chart" data={data} config={config} />

        <svg
          className="brush--svg"
          width={width}
          height={height}
          ref={(input) => {
            this.svg = input;
          }}
        >
          <defs>
            <filter id="shadow1" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                stdDeviation="2"
                in="blur"
                dx="0"
                dy="0"
                floodColor="#1F3646"
                floodOpacity="0.5"
                width="100%"
                height="100%"
                result="dropShadow"
              />
            </filter>
          </defs>

          {ready && this._renderBackground()}
          {ready && this._renderBrush()}
          {ready && this._renderAxis()}
        </svg>
      </div>
    );
  }
}
