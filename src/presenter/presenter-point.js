import { render, replace, remove } from '../framework/render.js';
import { isEscapeKey } from '../utils/common.js';
import EventsListItem from '../view/events-list-item.js';
import EditablePoint from '../view/editable-point.js';
import Event from '../view/event.js';

const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

export default class PresenterPoint {
  #destinationModel = null;
  #offersModel = null;
  #eventsListComponent = null;
  #offers = null;
  #destination = null;
  #handleModeChange = null;

  #listItem = new EventsListItem();

  #pointComponent = null;
  #pointEditComponent = null;

  #point = null;
  #mode = Mode.DEFAULT;

  #handleDataChange = null;

  constructor({destinationModel, offersModel, eventsListComponent, onDataChange, onModeChange}) {
    this.#destinationModel = destinationModel;
    this.#offersModel = offersModel;
    this.#eventsListComponent = eventsListComponent;
    this.#handleDataChange = onDataChange;
    this.#handleModeChange = onModeChange;
  }

  #renderListItem() {
    render(this.#listItem, this.#eventsListComponent.element);
  }

  init(point) {
    this.#point = point;

    const prevPointComponent = this.#pointComponent;
    const prevPointEditComponent = this.#pointEditComponent;

    this.#offers = this.#offersModel.getByType(this.#point.type);
    this.#destination = this.#destinationModel.getById(this.#point.destination);

    this.#pointComponent = new Event({
      point: this.#point,
      offers: this.#offers,
      destination: this.#destination,
      onClick: this.#handleEditClick,
      onFavoriteClick: this.#handleFavoriteClick,
    });

    this.#pointEditComponent = new EditablePoint({
      point: this.#point,
      offers: this.#offers,
      destination:  this.#destination,
      onClick: this.#handleFormClose,
      onFormSubmit: this.#handleFormSubmit,
    });

    if (prevPointComponent === null || prevPointEditComponent === null) {
      this.#renderListItem(); //рендерим li
      render(this.#pointComponent, this.#listItem.element); //рендерим точку в li
      return;
    }

    if (this.#mode === Mode.DEFAULT) {
      replace(this.#pointComponent, prevPointComponent);
    }

    if (this.#mode === Mode.EDITING) {
      replace(this.#pointEditComponent, prevPointEditComponent);
    }

    remove(prevPointComponent);
    remove(prevPointEditComponent);
  }

  resetView() {
    if (this.#mode !== Mode.DEFAULT) {
      this.#replaceFormToEvent();
    }
  }

  destroy() {
    remove(this.#pointComponent);
    remove(this.#pointEditComponent);
  }

  #replaceFormToEvent() {
    replace(this.#pointComponent, this.#pointEditComponent);
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = Mode.DEFAULT;
  }

  #replaceEventToForm() {
    replace(this.#pointEditComponent, this.#pointComponent);
    document.addEventListener('keydown', this.#escKeyDownHandler);
    this.#handleModeChange();
    this.#mode = Mode.EDITING;
  }

  #escKeyDownHandler = (evt) => {
    if (isEscapeKey(evt)) {
      evt.preventDefault();
      this.#replaceFormToEvent();
    }
  };

  #handleFavoriteClick = () => {
    this.#handleDataChange({...this.#point, isFavorite: !this.#point.isFavorite});
  };

  #handleEditClick = () => {
    this.#replaceEventToForm();
  };

  #handleFormClose = () => { //закрываем форму без сохранения
    this.#replaceFormToEvent();
  };

  #handleFormSubmit = (point) => { //сохраняем форму
    this.#handleDataChange(point);
    this.#replaceFormToEvent();
  };
}