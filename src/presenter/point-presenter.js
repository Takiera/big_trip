import Point from '../view/point';
import PointForm from '../view/point-form.js';
import { render, replace } from '../framework/render.js';

export default class PointPresenter {
  #pointsListComponent = null;
  #destinations = null;
  #offers = null;
  #view = null;
  #changeEditingPoint = null;
  #deletePoint = null;
  #updateFavorite = null;
  #isEditing = false;

  constructor({ destinations, offers, container, updatePoint, updateFavorite = updatePoint, changeEditingPoint, deletePoint }) {
    this.#pointsListComponent = container;
    this.updatePoint = updatePoint;
    this.#destinations = destinations;
    this.#offers = offers;
    this.#changeEditingPoint = changeEditingPoint;
    this.#deletePoint = deletePoint;
    this.#updateFavorite = updateFavorite;
  }

  init(point, renderPosition, isEditing = false) {
    this.point = point;
    this.#isEditing = isEditing;
    this.#view = isEditing ? this.createPointFormView() : this.createPointView();
    render(this.#view, this.#pointsListComponent, renderPosition);
  }

  createPointView() {
    return new Point({
      point: this.point,
      destinations: this.#destinations,
      offers: this.#offers,
      onEditClick: this.#onEditClick,
      onFavoriteButtonClick: this.#onFavoriteButtonClick,
    });
  }

  removeComponent = () => {
    this.#isEditing = false;
    this.#view?.remove();
    this.#view = null;
  };

  createPointFormView() {
    return new PointForm ({
      point: this.point,
      destinations: this.#destinations,
      offers: this.#offers,
      onFormClose: this.#onFormClose,
      onFormSubmit: this.#onFormSubmit,
      onDeletePoint: this.#onDeletePoint,
    });
  }

  update(point) {
    this.point = point;
    this.#isEditing = false;
    const updatedPointComponent = this.createPointView();
    replace(updatedPointComponent, this.#view);
    this.#view.remove();
    this.#view = updatedPointComponent;
  }

  enableEditMode = () => {
    if (this.#isEditing) {
      return;
    }
    this.#isEditing = true;
    const form = this.createPointFormView();

    replace(form, this.#view);
    this.#view.remove();
    this.#view = form;
  };

  disableEditMode = () => {
    if (!this.#isEditing) {
      return;
    }
    this.#isEditing = false;
    const point = this.createPointView();

    replace(point, this.#view);
    this.#view.remove();
    this.#view = point;
  };


  #onEditClick = () => {
    this.#changeEditingPoint(this.point.id);
  };

  #onFavoriteButtonClick = () => {
    this.#updateFavorite({...this.point, isFavorite: !this.point.isFavorite});
  };

  #onFormClose = () => {
    if (this.#isEditing) {
      this.#changeEditingPoint(null);
    }
  };

  #onFormSubmit = (updatedPoint) => {
    if (this.#isEditing) {
      this.updatePoint(updatedPoint);
    }
  };

  #onDeletePoint = (deletedPoint) => {
    if (this.#isEditing) {
      this.#deletePoint(deletedPoint);
    }
  };

}
