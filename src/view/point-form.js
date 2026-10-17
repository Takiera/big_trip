import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { capitalize, getDate } from '../helpers';
import { EVENT_TYPES } from '../const';
import { remove } from '../framework/render.js';
import { escapeHtml } from '../utils.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

const FORM_DATE_FORMAT = 'DD/MM/YYYY HH:mm';
const formatDate = (date) => date !== null && date !== undefined && Number.isFinite(new Date(date).getTime()) ? getDate(date, FORM_DATE_FORMAT) : '';

const parseDateInput = (value) => {
  const parts = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/.exec(value);
  if (!parts) {
    return null;
  }
  const [, day, month, year, hours, minutes] = parts;
  const date = new Date(0);
  date.setFullYear(Number(year), Number(month) - 1, Number(day));
  date.setHours(Number(hours), Number(minutes), 0, 0);
  return formatDate(date) === value ? date : null;
};

const createTypesList = (pointId, type) => `<div class="event__type-wrapper">
  <label class="event__type  event__type-btn" for="event-type-toggle-${pointId}">
    <span class="visually-hidden">Choose event type</span>
    <img class="event__type-icon" width="17" height="17" src="img/icons/${escapeHtml(type)}.png" alt="">
  </label>
  <input class="event__type-toggle  visually-hidden" id="event-type-toggle-${pointId}" type="checkbox">

  <div class="event__type-list">
    <fieldset class="event__type-group">
      <legend class="visually-hidden">Event type</legend>
      ${EVENT_TYPES.map((eventType) => `
        <div class="event__type-item">
          <input id="event-type-${eventType}-${pointId}" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${eventType}" ${eventType === type ? 'checked' : ''}>
          <label class="event__type-label  event__type-label--${eventType}" for="event-type-${eventType}-${pointId}">${capitalize(eventType)}</label>
        </div>`).join('\n')}
    </fieldset>
  </div>
</div>`;

const createPointDestinationTemplate = (pointDestination) => {
  const {description = '', pictures = []} = pointDestination || {};
  return (
    `<section class="event__section  event__section--destination">
      <h3 class="event__section-title  event__section-title--destination">Destination</h3>
      <p class="event__destination-description">${escapeHtml(description)}</p>
      ${pictures.length
      ? `<div class="event__photos-container">
            <div class="event__photos-tape">
              ${pictures.map((picture) => `<img class="event__photo" src="${escapeHtml(picture.src)}" alt="${escapeHtml(picture.description)}">`).join('')}
            </div>
          </div>`
      : ''}
    </section>`
  );
};
const createPointOffersTemplate = (typeOffers, point, pointId) => {
  const pointOffers = typeOffers.filter((item) => point.offers.includes(item.id));
  const activeOffers = pointOffers.map((offer) => offer.id);
  const offers = typeOffers.map((typeOffer) => (
    `<div class="event__offer-selector">
      <input class="event__offer-checkbox  visually-hidden" id="event-offer-${pointId}-${escapeHtml(typeOffer.id)}" type="checkbox" name="event-offer" value="${escapeHtml(typeOffer.id)}" ${activeOffers.includes(typeOffer.id) ? 'checked' : ''}>
      <label class="event__offer-label" for="event-offer-${pointId}-${escapeHtml(typeOffer.id)}">
      <span class="event__offer-title">${escapeHtml(typeOffer.title)}</span>
        &plus;&euro;&nbsp;
      <span class="event__offer-price">${escapeHtml(typeOffer.price)}</span>
      </label>
    </div>`)).join('\n');


  return (
    `<section class="event__section  event__section--offers">
      <h3 class="event__section-title  event__section-title--offers">Offers</h3>
      <div class="event__available-offers">
      ${offers}
    </div>
    </section>`
  );
};

const createPointFormTemplate = (point, destinations, offers) => {
  const {basePrice, dateFromInput, dateToInput, type} = point;
  const pointDestination = destinations.find((item) => item.id === point.destination);
  const typeOffers = offers.find((item) => item.type === point.type)?.offers;
  const pointId = escapeHtml(point.id ?? 'new-point');

  return `<li class="trip-events__item">
  <form class="event event--edit" action="#" method="post">
  <header class="event__header">
    ${createTypesList(pointId, type)}

    <div class="event__field-group  event__field-group--destination">
      <label class="event__label  event__type-output" for="event-destination-${pointId}">
      <span class="visually-hidden">Destination for </span>${escapeHtml(type)}
      </label>
      <select class="event__input  event__input--destination" id="event-destination-${pointId}" name="event-destination" required>
        ${pointDestination ? '' : '<option value="" disabled selected>Choose a destination</option>'}
        ${destinations.map((dest) => `<option value="${escapeHtml(dest.id)}" ${dest.id === point.destination ? 'selected' : ''}>${escapeHtml(dest.name)}</option>`).join('\n')}
      </select>
    </div>

    <div class="event__field-group  event__field-group--time">
      <label class="visually-hidden" for="event-start-time-${pointId}">From</label>
      <input class="event__input  event__input--time" id="event-start-time-${pointId}" type="text" name="event-start-time" value="${escapeHtml(dateFromInput)}" placeholder="DD/MM/YYYY HH:mm" autocomplete="off" required>
      &mdash;
      <label class="visually-hidden" for="event-end-time-${pointId}">To</label>
      <input class="event__input  event__input--time" id="event-end-time-${pointId}" type="text" name="event-end-time" value="${escapeHtml(dateToInput)}" placeholder="DD/MM/YYYY HH:mm" autocomplete="off" required>
    </div>

    <div class="event__field-group  event__field-group--price">
      <label class="event__label" for="event-price-${pointId}">
        <span class="visually-hidden">Price</span>
        &euro;
      </label>
      <input class="event__input  event__input--price" id="event-price-${pointId}" type="number" name="event-price" value="${escapeHtml(basePrice)}" min="0" step="any" inputmode="decimal" required>
    </div>

    <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
    <button class="event__reset-btn" type="reset">${pointId === 'new-point' ? 'Cancel' : 'Delete'}</button>
    ${pointId === 'new-point'
    ? ''
    : `<button class="event__rollup-btn" type="button">
        <span class="visually-hidden">Close event</span>
      </button>`}
  </header>

  <section class="event__details">
    ${typeOffers?.length ? createPointOffersTemplate(typeOffers, point, pointId) : ''}

    ${pointDestination ? createPointDestinationTemplate(pointDestination) : ''}
  </section>
</form>
</li>`;
};

export default class PointForm extends AbstractStatefulView {
  #point = null;
  #destinations = null;
  #offers = null;
  #handleFormClose = null;
  #handleFormSubmit = null;
  #datepickers = [];
  #onDeletePoint = null;

  constructor({point, destinations, offers, onFormClose, onFormSubmit, onDeletePoint}) {
    super();
    this.#point = point;
    this.#destinations = destinations;
    this.#offers = offers;
    this.#handleFormClose = onFormClose;
    this.#handleFormSubmit = onFormSubmit;
    this.#onDeletePoint = onDeletePoint;

    this._setState(PointForm.parsePointToState(point));
    this._restoreHandlers();
  }

  get template() {
    return createPointFormTemplate(this._state, this.#destinations, this.#offers);
  }

  static parsePointToState(point) {
    return {
      ...point,
      offers: [...(point.offers ?? [])],
      dateFromInput: formatDate(point.dateFrom),
      dateToInput: formatDate(point.dateTo),
    };
  }

  static parseStateToPoint(state) {
    const point = {...state, basePrice: Number(state.basePrice)};
    delete point.dateFromInput;
    delete point.dateToInput;
    return point;
  }

  _restoreHandlers() {
    document.addEventListener('keydown', this.#escapeHandler);
    this.element.querySelector('.event__rollup-btn')?.addEventListener('click', this.#formCloseHandler);
    this.element.querySelector('form').addEventListener('submit', this.#formSubmitHandler);
    this.element.querySelector('form').addEventListener('reset', this.#resetHandler);
    this.element.querySelector('.event__type-list').addEventListener('change', this.#onEventTypeChange);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#onDestinationChange);
    this.element.querySelector('.event__input--price').addEventListener('input', this.#onPriceChange);
    this.element.querySelector('.event__available-offers')?.addEventListener('change', this.#onOfferChange);

    this.#setDatepicker('event-start-time', 'dateFrom', 'dateFromInput');
    this.#setDatepicker('event-end-time', 'dateTo', 'dateToInput');
    this.#validateForm();
  }

  removeElement() {
    this.#datepickers.forEach((datepicker) => datepicker.destroy());
    this.#datepickers = [];
    document.removeEventListener('keydown', this.#escapeHandler);
    super.removeElement();
  }

  #formCloseHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormClose();
  };

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#validateForm();
    if (this.element.querySelector('form').reportValidity()) {
      this._setState({
        dateFrom: parseDateInput(this.element.querySelector('input[name="event-start-time"]').value),
        dateTo: parseDateInput(this.element.querySelector('input[name="event-end-time"]').value),
      });
      this.#handleFormSubmit(PointForm.parseStateToPoint(this._state));
    }
  };

  #escapeHandler = (event) => {
    if (event.key === 'Escape') {
      this.#formCloseHandler(event);
    }
  };

  #resetHandler = (evt) => {
    evt.preventDefault();
    if (this.#point.id !== null && this.#point.id !== undefined) {
      this.#onDeletePoint(this.#point);
    } else {
      this.#handleFormClose();
    }
  };

  remove = () => {
    remove(this);
  };

  #onEventTypeChange = (evt) => {
    if (EVENT_TYPES.includes(evt.target.value) && evt.target.value !== this._state.type) {
      this.updateElement({type: evt.target.value, offers: []});
    }
  };

  #onDestinationChange = (evt) => {
    const newDestination = this.#destinations.find((destination) => String(destination.id) === evt.target.value);
    this._setState({destination: newDestination?.id ?? null});
    const details = this.element.querySelector('.event__details');
    details.querySelector('.event__section--destination')?.remove();
    if (newDestination) {
      details.insertAdjacentHTML('beforeend', createPointDestinationTemplate(newDestination));
    }
    this.#validateForm();
  };

  #onPriceChange = (evt) => {
    this._setState({basePrice: evt.target.value});
    this.#validateForm();
  };

  #onOfferChange = () => {
    const typeOffers = this.#offers.find((offer) => offer.type === this._state.type)?.offers ?? [];
    const selectedIds = [...this.element.querySelectorAll('.event__offer-checkbox:checked')].map((input) => input.value);
    this._setState({offers: typeOffers.filter((offer) => selectedIds.includes(String(offer.id))).map((offer) => offer.id)});
  };

  #setDatepicker = (name, dateKey, inputKey) => {
    const input = this.element.querySelector(`input[name="${name}"]`);
    const draft = this._state[inputKey];
    const syncDate = ([date], value) => {
      this._setState({[dateKey]: date ?? null, [inputKey]: value});
      this.#validateForm();
    };
    input.value = '';
    const datepicker = flatpickr(input, {
      enableTime: true,
      allowInput: true,
      disableMobile: true,
      time_24hr: true, //eslint-disable-line
      dateFormat: 'd/m/Y H:i',
      parseDate: (value) => parseDateInput(value) ?? undefined,
      defaultDate: this._state[dateKey] ? new Date(this._state[dateKey]) : null,
      onChange: syncDate,
      onValueUpdate: syncDate,
    });
    input.value = draft;
    input.addEventListener('input', () => {
      this._setState({[dateKey]: parseDateInput(input.value), [inputKey]: input.value});
      this.#validateForm();
    });
    this.#datepickers.push(datepicker);
  };

  #validateForm = () => {
    const destination = this.element.querySelector('.event__input--destination');
    const price = this.element.querySelector('.event__input--price');
    const start = this.element.querySelector('input[name="event-start-time"]');
    const end = this.element.querySelector('input[name="event-end-time"]');
    const validDestination = this.#destinations.some((item) => item.id === this._state.destination && String(item.id) === destination.value);
    destination.setCustomValidity(validDestination ? '' : 'Choose a destination from the list.');
    const validPrice = price.value.trim() !== '' && Number.isFinite(Number(price.value)) && Number(price.value) >= 0;
    price.setCustomValidity(validPrice ? '' : 'Enter a finite price of zero or more.');
    const dateFrom = parseDateInput(start.value);
    const dateTo = parseDateInput(end.value);
    start.setCustomValidity(dateFrom ? '' : 'Enter a valid start date and time: DD/MM/YYYY HH:mm.');
    end.setCustomValidity(!dateTo ? 'Enter a valid end date and time: DD/MM/YYYY HH:mm.' : '');
    if (dateFrom && dateTo && dateTo < dateFrom) {
      end.setCustomValidity('End date and time must be on or after the start.');
    }
    [destination, price, start, end].forEach((input) => {
      input.setAttribute('aria-invalid', String(!input.validity.valid));
    });
  };
}
