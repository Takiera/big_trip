import AbstractView from '../framework/view/abstract-view.js';

const FILTER_ITEMS = [
  {
    label: 'Everything',
    id: 'filter-everything',
    initialValue: 'everything'
  },
  {
    label: 'Future',
    id: 'filter-future',
    initialValue: 'future'
  },
  {
    label: 'Present',
    id: 'filter-present',
    initialValue: 'present'
  },
  {
    label: 'Past',
    id: 'filter-past',
    initialValue: 'past'
  },
];

const createFilterItemTemplate = ({label, id, initialValue}, currentFilter) => `
  <div class="trip-filters__filter">
    <input id="${id}" class="trip-filters__filter-input  visually-hidden" type="radio" name="trip-filter" value="${initialValue}" ${initialValue === currentFilter ? 'checked' : ''}>
    <label class="trip-filters__filter-label" for="${id}">${label}</label>
  </div>`;


const createFilterTemplate = (currentFilter) => `
<form class="trip-filters" action="#" method="get">
  ${FILTER_ITEMS.map((item) => createFilterItemTemplate(item, currentFilter)).join('\n')}

  <button class="visually-hidden" type="submit">Accept filter</button>
</form>`;

export default class FilterForm extends AbstractView {
  #currentFilter = null;
  #handleFilterChange = null;

  constructor({currentFilter = 'everything', onFilterChange = () => {}} = {}) {
    super();
    this.#currentFilter = currentFilter;
    this.#handleFilterChange = onFilterChange;
    this.element.addEventListener('change', this.#filterChangeHandler);
    this.element.addEventListener('submit', this.#submitHandler);
  }

  get template() {
    return createFilterTemplate(this.#currentFilter);
  }

  #filterChangeHandler = (evt) => {
    if (!evt.target.matches('input[name="trip-filter"]')) {
      return;
    }

    this.#currentFilter = evt.target.value;
    this.#handleFilterChange(this.#currentFilter);
  };

  #submitHandler = (evt) => {
    evt.preventDefault();
  };
}
