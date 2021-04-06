import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import intersection from 'lodash/intersection';
import sortBy from 'lodash/sortBy';
import slice from 'lodash/slice';
import { Tooltip } from 'react-tippy';
import { deburrUpper } from 'utils/strings';

import { Row, Column } from 'gfw-components';

import Tip from 'components/ui/tip';
import Icon from 'components/ui/icon';
import Button from 'components/ui/button';
import AoICard from 'components/aoi-card';
import Pill from 'components/ui/pill';
import NoContent from 'components/ui/no-content';
import Dropdown from 'components/ui/dropdown';
import Search from 'components/ui/search';
import Paginate from 'components/paginate';
import ConfirmSubscriptionModal from 'components/modals/confirm-subscription';

import mapIcon from 'assets/icons/view-map.svg?sprite';
import editIcon from 'assets/icons/edit.svg?sprite';
import shareIcon from 'assets/icons/share.svg?sprite';

import './styles.scss';

const isServer = typeof window === 'undefined';

class AreasTable extends PureComponent {
  static propTypes = {
    areas: PropTypes.array,
    tags: PropTypes.array,
    viewArea: PropTypes.func,
    setAreaOfInterestModalSettings: PropTypes.func,
    setShareModal: PropTypes.func,
  };

  state = {
    activeTags: [],
    // areas: [],
    // selectedTags: [],
    // unselectedTags: [],
    sortBy: '',
    search: '',
    alerts: {},
    pageSize: 6,
    pageNum: 0,
  };

  componentDidUpdate(prevProps) {
    const { areas } = this.props;
    const { areas: prevAreas } = prevProps;

    if (areas.length !== prevAreas.length) {
      this.resetPageNum();
    }
  }

  resetPageNum = () => {
    this.setState({ pageNum: 0 });
  };

  render() {
    const {
      viewArea,
      setAreaOfInterestModalSettings,
      setShareModal,
      areas,
      tags,
    } = this.props;
    const {
      activeTags,
      search,
      pageSize,
      pageNum,
      alerts: allAlerts,
    } = this.state;

    const areasWithAlerts =
      areas &&
      areas.map((area) => {
        const alerts = allAlerts[area.id];
        return {
          ...area,
          ...alerts,
        };
      });

    // get tags based on areas available
    const selectedTags =
      activeTags && tags && tags.filter((t) => activeTags.includes(t.value));
    const unselectedTags =
      activeTags && tags && tags.filter((t) => !activeTags.includes(t.value));

    // filter areas based on tags selected
    const filteredAreas =
      selectedTags &&
      selectedTags.length &&
      areasWithAlerts &&
      areasWithAlerts.length
        ? areasWithAlerts.filter(
            (a) => !!intersection(a.tags, activeTags).length
          )
        : areasWithAlerts;

    // filter areas by search
    const filterAreasBySearch =
      filteredAreas && filteredAreas.length && search
        ? filteredAreas.filter((a) =>
            deburrUpper(a.name).includes(deburrUpper(search))
          )
        : filteredAreas;

    // sort areas by given parameter
    const sortedAreas = this.state.sortBy
      ? sortBy(filterAreasBySearch, this.state.sortBy)
      : filterAreasBySearch;

    // finally order again by date
    const orderedAreas =
      this.state.sortBy === 'createdAt' ? sortedAreas.reverse() : sortedAreas;

    const areasTrimmed = slice(
      orderedAreas,
      pageSize * pageNum,
      pageSize * (pageNum + 1)
    );

    const hasSelectedTags = selectedTags && !!selectedTags.length;
    const hasUnselectedTags = unselectedTags && !!unselectedTags.length;

    return (
      <div className="c-areas-table">
        <Row nested className="filter-row">
          <Column width={[1, 5 / 12]} className="filter-group">
            {(hasSelectedTags || hasUnselectedTags) && (
              <span className="filter-title">Filter by tag</span>
            )}
            <div className="filter-tags">
              {hasSelectedTags &&
                selectedTags.map((tag) => (
                  <Pill
                    className="filter-tag"
                    key={tag.value}
                    active
                    label={tag.label}
                    onRemove={() =>
                      this.setState({
                        activeTags: activeTags.filter((t) => t !== tag.value),
                        pageNum: 0,
                      })}
                  />
                ))}
              {hasUnselectedTags && (
                <Dropdown
                  className="filter-tag"
                  theme="theme-dropdown-button theme-dropdown-button-small"
                  placeholder={
                    activeTags && activeTags.length > 0
                      ? 'Add more tags'
                      : 'Filter by tags'
                  }
                  noItemsFound="No tags found"
                  noSelectedValue={
                    activeTags && activeTags.length > 0
                      ? 'Add more tags'
                      : 'Filter by tags'
                  }
                  options={unselectedTags}
                  onChange={(tag) =>
                    tag.value &&
                    this.setState({
                      activeTags: [...activeTags, tag.value],
                      pageNum: 0,
                    })}
                />
              )}
            </div>
          </Column>
          <Column width={[1, 1 / 3]} className="filter-group">
            <span className="filter-title">Order by</span>
            <div className="filter-tags">
              <Pill
                className="filter-tag"
                active={this.state.sortBy === 'createdAt'}
                label="Creation date"
                onClick={() =>
                  this.setState({
                    sortBy:
                      this.state.sortBy === 'createdAt' ? '' : 'createdAt',
                    pageNum: 0,
                  })}
              />
              {/* <Pill
                className="filter-tag"
                active={this.state.sortBy === 'glads'}
                label="GLAD alerts"
                onClick={() =>
                  this.setState({
                    sortBy: this.state.sortBy === 'glads' ? '' : 'glads',
                    pageNum: 0
                  })
                }
              />
              <Pill
                className="filter-tag"
                active={this.state.sortBy === 'fires'}
                label="VIIRS alerts"
                onClick={() =>
                  this.setState({
                    sortBy: this.state.sortBy === 'fires' ? '' : 'fires',
                    pageNum: 0
                  })
                }
              /> */}
            </div>
          </Column>
          <Column width={[1, 1 / 4]}>
            <div className="filter-search">
              <Search
                theme="theme-search-small"
                placeholder="Search"
                input={search}
                onChange={(value) =>
                  this.setState({ search: value, pageNum: 0 })}
              />
            </div>
          </Column>
        </Row>
        <div>
          {areasTrimmed && !!areasTrimmed.length ? (
            areasTrimmed.map((area) => (
              <Row nested key={area.id} className="area-row">
                <Column width={[1, 3 / 4]}>
                  <Tooltip
                    theme="light"
                    followCursor
                    html={<Tip text="Open dashboard" />}
                  >
                    <div
                      className="area-button"
                      onClick={() => {
                        viewArea({
                          areaId: area.id,
                          pathname: '/dashboards/[[...location]]',
                        });
                      }}
                      role="button"
                      tabIndex={0}
                      alt="view area"
                    >
                      <AoICard
                        {...area}
                        onFetchAlerts={(alertsResponse) =>
                          this.setState({
                            alerts: { ...allAlerts, [area.id]: alertsResponse },
                          })}
                      />
                    </div>
                  </Tooltip>
                </Column>
                <Column width={[1, 1 / 4]}>
                  <div className="area-links">
                    <Button
                      className="area-link"
                      theme="theme-button-clear"
                      onClick={() =>
                        viewArea({
                          areaId: area.id,
                          pathname: '/map/[[...location]]',
                        })}
                    >
                      <Icon className="link-icon" icon={mapIcon} />
                      view on map
                    </Button>
                    <Button
                      className="area-link"
                      theme="theme-button-clear"
                      onClick={() => setAreaOfInterestModalSettings(area.id)}
                    >
                      <Icon className="link-icon" icon={editIcon} />
                      edit
                    </Button>
                    <Button
                      className="area-link"
                      theme="theme-button-clear"
                      onClick={() =>
                        setShareModal({
                          title: 'Share your area',
                          shareUrl:
                            !isServer &&
                            `${window.location.host}/dashboards/aoi/${area.id}`,
                        })}
                    >
                      <Icon className="link-icon" icon={shareIcon} />
                      share
                    </Button>
                  </div>
                </Column>
              </Row>
            ))
          ) : (
            <Row nested className="no-content-row">
              <Column>
                <NoContent
                  className="no-areas-msg"
                  message="No areas with that search"
                />
              </Column>
            </Row>
          )}
        </div>
        {orderedAreas.length > pageSize && (
          <Paginate
            settings={{
              page: pageNum,
              pageSize,
            }}
            count={orderedAreas.length}
            onClickChange={(increment) =>
              this.setState({ pageNum: pageNum + increment })}
          />
        )}
        <ConfirmSubscriptionModal />
      </div>
    );
  }
}

export default AreasTable;
