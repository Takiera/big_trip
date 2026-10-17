import FilterForm from '../view/filter';
import SortForm from '../view/sort';
import PointsList from '../view/points-list';
import EmptyPointsListView from '../view/empty-points-list.js';
import { render, remove, RenderPosition } from '../framework/render.js';
import PointPresenter from './point-presenter.js';
import { sortByDay, sortByTime, sortByPrice } from '../helpers.js';
import { getDefaultPoint } from '../mock/points.js';
import { FilterTypes } from '../const.js';

const SORT_FUNCTIONS = {
  'sort-day': sortByDay,
  'sort-time': sortByTime,
  'sort-price': sortByPrice,
};

export default class TripPlanPresenter {
  #pointsListComponent = null;
  #filterComponent = null;
  #sortComponent = null;
  #emptyPointsComponent = null;
  #filterContainer = null;
  #eventsContainer = null;
  #pointModel = null;
  #pointPresenters = new Map();
  #editingPointId = null;
  #currentSortType = 'sort-day';
  #currentFilter = FilterTypes.EVERYTHING;
  #newPointButton = null;
  #newPointPresenter = null;

  constructor(headerContainer, mainContainer, pointModel, newPointButton) {
    this.#filterContainer = headerContainer;
    this.#eventsContainer = mainContainer;
    this.#pointModel = pointModel;
    this.#newPointButton = newPointButton;
  }

  init() {
    this.#renderFilter();
    this.#renderPointsList();
    this.#newPointButton.addEventListener('click', this.#onNewEventClick);
  }

  #renderFilter() {
    remove(this.#filterComponent);
    this.#filterComponent = new FilterForm({
      currentFilter: this.#currentFilter,
      onFilterChange: this.#onFilterChange,
    });
    render(this.#filterComponent, this.#filterContainer);
  }

  #getVisiblePoints() {
    const now = Date.now();
    const points = this.#pointModel.points.filter((point) => {
      const start = new Date(point.dateFrom).getTime();
      const end = new Date(point.dateTo).getTime();

      switch (this.#currentFilter) {
        case FilterTypes.FUTURE:
          return start > now;
        case FilterTypes.PAST:
          return end < now;
        case FilterTypes.PRESENT:
          return start <= now && end >= now;
        default:
          return true;
      }
    });

    return points.sort(SORT_FUNCTIONS[this.#currentSortType]);
  }

  #renderPointsList() {
    this.#clearPointsList();
    const points = this.#getVisiblePoints();

    if (points.length === 0) {
      this.#emptyPointsComponent = new EmptyPointsListView({ filter: this.#currentFilter });
      render(this.#emptyPointsComponent, this.#eventsContainer);
      return;
    }

    this.#sortComponent = new SortForm({
      currentSortType: this.#currentSortType,
      onSortChange: this.#onSortTypeChange,
    });
    render(this.#sortComponent, this.#eventsContainer);
    this.#pointsListComponent = new PointsList();
    render(this.#pointsListComponent, this.#eventsContainer);
    points.forEach(this.#renderPoint);
  }

  updatePoint = (point) => {
    this.#pointModel.updatePoint(point);
    this.#renderPointsList();
  };

  #updateFavorite = (point) => {
    this.#pointModel.updatePoint(point);
    this.#pointPresenters.get(point.id)?.update(point);
  };

  #renderPoint = (point) => {
    const pointPresenter = new PointPresenter({
      destinations: this.#pointModel.destinations,
      offers: this.#pointModel.offers,
      container: this.#pointsListComponent.element,
      updatePoint: this.updatePoint,
      updateFavorite: this.#updateFavorite,
      changeEditingPoint: this.changeEditingPoint,
      deletePoint: this.#deletePoint,
    });
    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  };

  #onNewEventClick = () => {
    if (this.#newPointPresenter) {
      return;
    }

    this.changeEditingPoint(null);
    if (this.#currentFilter !== FilterTypes.EVERYTHING) {
      this.#currentFilter = FilterTypes.EVERYTHING;
      this.#renderFilter();
      this.#renderPointsList();
    }

    remove(this.#emptyPointsComponent);
    this.#emptyPointsComponent = null;
    if (!this.#pointsListComponent) {
      this.#pointsListComponent = new PointsList();
      render(this.#pointsListComponent, this.#eventsContainer);
    }

    this.#newPointPresenter = new PointPresenter({
      destinations: this.#pointModel.destinations,
      offers: this.#pointModel.offers,
      container: this.#pointsListComponent.element,
      updatePoint: this.#addPoint,
      changeEditingPoint: this.#onCancelButton,
      deletePoint: this.#onCancelButton,
    });
    this.#newPointPresenter.init(getDefaultPoint(), RenderPosition.AFTERBEGIN, true);
    this.#newPointButton.disabled = true;
  };

  #addPoint = (point) => {
    this.#pointModel.addPoint(point);
    this.#renderPointsList();
  };

  #onCancelButton = () => {
    this.#renderPointsList();
  };

  #removeNewPoint() {
    this.#newPointPresenter?.removeComponent();
    this.#newPointPresenter = null;
    this.#newPointButton.disabled = false;
  }

  changeEditingPoint = (pointId) => {
    this.#removeNewPoint();
    this.#pointPresenters.get(this.#editingPointId)?.disableEditMode();
    this.#editingPointId = null;

    const pointPresenter = this.#pointPresenters.get(pointId);
    if (pointPresenter) {
      pointPresenter.enableEditMode();
      this.#editingPointId = pointId;
    }
  };

  #clearPointsList() {
    this.#removeNewPoint();
    this.#pointPresenters.forEach((presenter) => presenter.removeComponent());
    this.#pointPresenters.clear();
    this.#editingPointId = null;
    remove(this.#sortComponent);
    remove(this.#emptyPointsComponent);
    remove(this.#pointsListComponent);
    this.#sortComponent = null;
    this.#emptyPointsComponent = null;
    this.#pointsListComponent = null;
  }

  #onSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType || !Object.hasOwn(SORT_FUNCTIONS, sortType)) {
      return;
    }

    this.#currentSortType = sortType;
    this.#renderPointsList();
  };

  #onFilterChange = (filter) => {
    if (this.#currentFilter === filter || !Object.values(FilterTypes).includes(filter)) {
      return;
    }

    this.#currentFilter = filter;
    this.#renderFilter();
    this.#renderPointsList();
  };

  #deletePoint = (point) => {
    this.#pointModel.deletePoint(point);
    this.#renderPointsList();
  };
}
