import classNames from "classnames";
import {
  Children,
  cloneElement,
  Component,
  createElement,
  createRef,
  ReactElement,
  RefObject
} from "react";
import Sortable, { MoveEvent, Options, SortableEvent } from "sortablejs";
import invariant from "tiny-invariant";
import {
  AllMethodsExceptMove,
  HandledMethodNames,
  ItemInterface,
  ReactSortableProps,
  Store,
  UnHandledMethodNames
} from "./types";
import {
  createCustoms,
  destructurePropsForOptions,
  getMode,
  handleStateAdd,
  handleStateChanges,
  handleStateRemove,
  insertNodes,
  removeNode,
  removeNodes
} from "./util";
/** Holds a global reference for which react element is being dragged */
// @todo - use context to manage this. How does one use 2 different providers?
const store: Store = { dragging: null };

export class ReactSortable<T extends ItemInterface> extends Component<
  ReactSortableProps<T>
> {
  static defaultProps: Partial<ReactSortableProps<any>> = {
    clone: item => item
  };

  private ref: RefObject<HTMLElement>;
  constructor(props: ReactSortableProps<T>) {
    super(props);
    // @todo forward ref this component
    this.ref = createRef<HTMLElement>();

    // make all state false because we can't change sortable unless a mouse gesture is made.
    const newList = props.list.map(item => ({
      ...item,
      chosen: false,
      selected: false
    }));

    props.setList(newList, this.sortable, store);
    invariant(
      //@ts-ignore
      !props.plugins,
      `
Plugins prop is no longer supported.
Instead, mount it with "Sortable.mount(new MultiDrag())"
Please read the updated README.md at https://github.com/SortableJS/react-sortablejs.
      `
    );
  }
  componentDidMount() {
    if (this.ref.current === null) return;
    const newOptions = this.makeOptions();
    Sortable.create(this.ref.current, newOptions);
  }

  render() {
    const { tag, style, className, id } = this.props;
    const classicProps = { style, className, id };

    // if no tag, default to a `div` element.
    const newTag = !tag || tag === null ? "div" : tag;
    return createElement(
      newTag,
      {
        // @todo - find a way (perhaps with the callback) to allow AntD components to work
        ref: this.ref,
        ...classicProps
      },
      this.getChildren()
    );
  }

  private getChildren() {
    const {
      children,
      dataIdAttr,
      selectedClass = "sortable-selected",
      chosenClass = "sortable-chosen",
      dragClass = "sortable-drag",
      fallbackClass = "sortable-falback",
      ghostClass = "sortable-ghost",
      swapClass = "sortable-swap-highlight",
      filter = "sortable-filter",
      list
    } = this.props;

    // if no children, don't do anything.
    if (!children || children == null) return null;
    const dataid = dataIdAttr || "data-id";
    return Children.map(children as ReactElement<any>[], (child, index) => {
      const item = list[index];
      const {
        className: prevClassName,
      } = child.props;

      // @todo - handle the function if avalable. I don't think anyone will be doing this soon.
      const filtered = typeof filter === "string" && {
        [filter.replace(".", "")]: !!item.filtered
      };

      const className = classNames(prevClassName, {
        [selectedClass]: item.selected,
        [chosenClass]: item.chosen,
        ...filtered
        // [dragClass]: true,
        // [fallbackClass]: true,
        // [ghostClass]: true,
        // [swapClass]: true
      });

      return cloneElement(child, {
        [dataid]: child.key,
        className
      });
    });
  }

  /** Appends the `sortable` property to this component */
  private get sortable(): Sortable | null {
    const el = this.ref.current;
    if (el === null) return null;
    const key = Object.keys(el).find(k => k.includes("Sortable"));
    if (!key) return null;
    //@ts-ignore - I know what I'm doing.
    return el[key] as Sortable;
  }

  /** Converts all the props from `ReactSortable` into the `options` object that `Sortable.create(el, [options])` can use. */
  makeOptions(): Options {
    const DOMHandlers: HandledMethodNames[] = [
      "onAdd",
      "onChoose",
      "onDeselect",
      "onEnd",
      "onRemove",
      "onSelect",
      "onSpill",
      "onStart",
      "onUnchoose",
      "onUpdate"
    ];
    const NonDOMHandlers: UnHandledMethodNames[] = [
      "onChange",
      "onClone",
      "onFilter",
      "onSort"
    ];
    const newOptions: Options = destructurePropsForOptions(this.props);
    DOMHandlers.forEach(
      name => (newOptions[name] = this.prepareOnHandlerPropAndDOM(name))
    );
    NonDOMHandlers.forEach(
      name => (newOptions[name] = this.prepareOnHandlerProp(name))
    );

    /** onMove has 2 arguments and needs to be handled seperately. */
    const onMove = (evt: MoveEvent, originalEvt: Event) => {
      const { onMove } = this.props;
      const defaultValue = evt.willInsertAfter || -1;
      if (!onMove) return defaultValue;
      const result =  onMove(evt, originalEvt, this.sortable, store);
      if (typeof result === 'undefined') return false
      return result
    };

    return {
      ...newOptions,
      onMove
    };
  }

  /** Prepares a method that will be used in the sortable options to call an `on[Handler]` prop & an `on[Handler]` ReactSortable method.  */
  prepareOnHandlerPropAndDOM(evtName: HandledMethodNames) {
    return (evt: SortableEvent) => {
      // call the component prop
      this.callOnHandlerProp(evt, evtName);
      // calls state change
      //@ts-ignore - until @types multidrag item is in
      this[evtName](evt);
    };
  }

  /** Prepares a method that will be used in the sortable options to call an `on[Handler]` prop */
  prepareOnHandlerProp(
    evtName: Exclude<AllMethodsExceptMove, HandledMethodNames>
  ) {
    return (evt: SortableEvent) => {
      // call the component prop
      this.callOnHandlerProp(evt, evtName);
    };
  }

  /** Calls the `props.on[Handler]` function */
  callOnHandlerProp(evt: SortableEvent, evtName: AllMethodsExceptMove) {
    const propEvent = this.props[evtName];
    if (propEvent) propEvent(evt, this.sortable, store);
  }

  // SORTABLE DOM HANDLING

  onAdd(evt: MultiDragEvent) {
    const { list, setList, clone } = this.props;
    const otherList = [...store.dragging!.props.list];
    const customs = createCustoms(evt, otherList);
    removeNodes(customs);
    const newList = handleStateAdd(customs, list, evt, clone).map(item => ({ ...item, selected: false }));
    setList(newList, this.sortable, store);
  }

  onRemove(evt: MultiDragEvent) {
    const { list, setList } = this.props;
    const mode = getMode(evt);
    const customs = createCustoms(evt, list);
    insertNodes(customs);

    let newList = [...list];
    // remove state if not in clone mode. otherwise, keep.
    if (evt.pullMode !== "clone") newList = handleStateRemove(customs, newList);
    // if clone, it doesn't really remove. instead it clones in place.
    // @todo -
    else {
      // switch used to get the clone
      let customClones = customs;
      switch (mode) {
        case "multidrag":
          customClones = customs.map((item, index) => ({
            ...item,
            element: evt.clones[index]
          }));
          break;
        case "normal":
          customClones = customs.map((item, index) => ({
            ...item,
            element: evt.clone
          }));
          break;
        case "swap":
        default: {
          invariant(
            true,
            `mode "${mode}" cannot clone. Please remove "props.clone" from <ReactSortable/> when using the "${mode}" plugin`
          );
        }
      }
      removeNodes(customClones);

      // replace selected items with cloned items
      customs.forEach(curr => {
        const index = curr.oldIndex;
        const newItem = this.props.clone!(curr.item, evt);
        newList.splice(index, 1, newItem);
      });
    }

    // remove item.selected from list
    newList = newList.map(item => ({ ...item, selected: false }));
    setList(newList, this.sortable, store);
  }

  onUpdate(evt: MultiDragEvent) {
    const { list, setList } = this.props;
    const customs = createCustoms(evt, list);
    removeNodes(customs);
    insertNodes(customs);
    const newList = handleStateChanges(customs, list);
    return setList(newList, this.sortable, store);
  }

  onStart(evt: SortableEvent) {
    store.dragging = this;
  }

  onEnd(evt: SortableEvent) {
    store.dragging = null;
  }

  onChoose(evt: SortableEvent) {
    const { list, setList } = this.props;
    const newList = list.map((item, index) => {
      if (index === evt.oldIndex) {
        return {
          ...item,
          chosen: true,
        }
      }
      return item;
    });
    setList(newList, this.sortable, store);
  }

  onUnchoose(evt: SortableEvent) {
    const { list, setList } = this.props;
    const newList = list.map((item, index) => {
      if (index === evt.oldIndex) {
        return {
          ...item,
          chosen: false,
        }
      }
      return item;
    });
    setList(newList, this.sortable, store);
  }

  onSpill(evt: SortableEvent) {
    const { removeOnSpill, revertOnSpill } = this.props;
    if (removeOnSpill && !revertOnSpill) removeNode(evt.item);
  }

  onSelect(evt: MultiDragEvent) {
    const { list, setList } = this.props;
    const newList = list.map(item => ({ ...item, selected: false }));
    evt.newIndicies.forEach(curr => {
      const index = curr.index;
      if (index === -1) {
        console.log(
          `"${evt.type}" had indice of "${curr.index}", which is probably -1 and doesn't usually happen here.`
        );
        console.log(evt)
        return
      }
      newList[index].selected = true;
    });
    setList(newList, this.sortable, store);
  }

  onDeselect(evt: MultiDragEvent) {
    const { list, setList } = this.props;
    const newList = list.map(item => ({ ...item, selected: false }));
    evt.newIndicies.forEach(curr => {
      const index = curr.index;
      if (index === -1) return;
      newList[index].selected = true;
    });
    setList(newList, this.sortable, store);
  }
}

// everything below this point can be removed
// once @types has been merged. PR submited
interface MultiIndices {
  multiDragElement: HTMLElement;
  index: number;
}

export interface MultiDragEvent extends SortableEvent {
  // @todo - add this to @types
  clones: HTMLElement[];
  oldIndicies: MultiIndices[];
  newIndicies: MultiIndices[];
  swapItem: HTMLElement | null;
}
