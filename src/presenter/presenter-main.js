import { render, replace } from '../framework/render.js';
import Sorting from '../view/sorting.js';
import EventsList from '../view/events-list.js';
import EventsListItem from '../view/events-list-item.js';
import Event from '../view/event.js';
import EditablePoint from '../view/editable-point.js';
import { isEscapeKey } from '../utils.js';

export default class PresenterMain {
  #presenterContainer = null;
  #destinationModel = null;
  #offersModel = null;
  #pointsModel = null;
  #points = null;
  #sortingComponent = new Sorting(); //сортировка
  #eventsListComponent = new EventsList(); //список ul
  //#pairArray = null;

  constructor ({presenterContainer, destinationModel, offersModel, pointsModel}) {
    this.#presenterContainer = presenterContainer;
    this.#destinationModel = destinationModel;
    this.#offersModel = offersModel;
    this.#pointsModel = pointsModel;
  }

  init() {
    this.#points = [...this.#pointsModel.points];

    render(this.#sortingComponent, this.#presenterContainer); //сортировка
    render(this.#eventsListComponent, this.#presenterContainer); //список ul

    for (let i = 0; i < this.#points.length; i++) {
      this.#renderPoint(this.#points[i]);
    }
  }

  #renderPoint(point) {
    const escKeyDownHandler = (evt) => {
      if (isEscapeKey) {
        evt.preventDefault();
        // if (this.#pairArray !== null) {
        //   this.#pairArray = null;
        // }
        replaceFormToEvent();
        document.removeEventListener('keydown', escKeyDownHandler);
      }
    };
    const destinationId = point.destination;
    const destination = this.#destinationModel.getById(destinationId);
    const type = point.type;
    const offers = this.#offersModel.getByType(type);
    const list = this.#eventsListComponent.element;
    const listItem = new EventsListItem();
    const form = new EditablePoint({
      point,
      offers,
      destination,
      onClick: () => {
        // if (this.#pairArray !== null) {
        //   this.#pairArray = null;
        // }
        replaceFormToEvent();
        document.removeEventListener('keydown', escKeyDownHandler);
      },
      onFormSubmit: () => {
        // if (this.#pairArray !== null) {
        //   this.#pairArray = null;
        // }
        replaceFormToEvent();
        document.removeEventListener('keydown', escKeyDownHandler);
      },
    });
    const event = new Event({
      point,
      offers,
      destination,
      onClick: () => {
        // if (this.#pairArray !== null) {
        //   replace(this.#pairArray[1], this.#pairArray[0]);
        // }
        replaceEventToForm();

        // this.#pairArray = Array.of(form, event);

        document.addEventListener('keydown', escKeyDownHandler);
      }
    });

    function replaceFormToEvent() {
      replace(event, form);
    }

    function replaceEventToForm() {
      replace(form, event);
    }

    render(listItem, list); //рендерим li
    render(event, listItem.element); //рендерим точку в li
  }
}
