import { PropsWithChildren } from "react";
import Sortable, { Options } from "sortablejs";
import { MultiDragEvent } from "./react-sortable";
import { AllMethodNames, ItemInterface, ReactSortableProps } from "./types";

/**
 * Removes the `node` from the DOM
 * @param node
 */
export function removeNode(node: HTMLElement) {
  if (node.parentElement !== null) node.parentElement.removeChild(node);
}

/**
 * Inserts the `newChild` node at the given index in a parent
 * @param parent The parent HTML Element.
 * @param newChild A HTML eement to add as a child of the parent.
 * @param index index of the parent to place the new child in.
 */
export function insertNodeAt(
  parent: HTMLElement,
  newChild: HTMLElement,
  index: number
) {
  const refChild = parent.children[index] || null;
  parent.insertBefore(newChild, refChild);
}

// @todo - create a dom handler function for arrays or not at all

/** removes stuff from the dom in a nice order */
// @todo - do I need parenElement?
export function handleDOMChanges<T extends ItemInterface>(
  customs: Normalized<T>[]
) {
  removeNodes(customs);
  insertNodes(customs);
}

export function removeNodes<T extends ItemInterface>(customs: Normalized<T>[]) {
  customs.forEach(curr => removeNode(curr.element));
}

export function insertNodes<T extends ItemInterface>(customs: Normalized<T>[]) {
  customs.forEach(curr => {
    insertNodeAt(curr.parentElement, curr.element, curr.oldIndex);
  });
}

export function createCustoms<T extends ItemInterface>(
  evt: MultiDragEvent,
  list: T[]
) {
  const mode = getMode(evt);
  const parentElement = { parentElement: evt.from };
  let custom = [];
  switch (mode) {
    case "normal":
      const item = {
        element: evt.item,
        newIndex: evt.newIndex!,
        oldIndex: evt.oldIndex!,
        parentElement: evt.from
      };
      custom = [item];
      break;
    case "swap":
      const drag: Input = {
        element: evt.item,
        oldIndex: evt.oldIndex!,
        newIndex: evt.newIndex!,
        ...parentElement
      };
      const swap: Input = {
        element: evt.swapItem!,
        oldIndex: evt.newIndex!,
        newIndex: evt.oldIndex!,
        ...parentElement
      };
      custom = [drag, swap];
      break;
    case "multidrag":
      custom = evt.oldIndicies.map<Input>((curr, index) => ({
        element: curr.multiDragElement,
        oldIndex: curr.index,
        newIndex: evt.newIndicies[index].index,
        ...parentElement
      }));
      break;
  }
  const customs = createNormalized(custom, list);
  return customs;
}

/** moves items form old index to new index without breaking anything ideally. */
export function handleStateChanges<T extends ItemInterface>(
  normalized: Normalized<T>[],
  list: T[]
): T[] {
  const a = handleStateRemove(normalized, list);
  const b = handleStateAdd(normalized, a);
  return b;
}

export function handleStateRemove<T extends ItemInterface>(
  normalized: Normalized<T>[],
  list: T[]
): T[] {
  const newList = [...list];
  normalized
    .concat()
    .reverse()
    .forEach(curr => newList.splice(curr.oldIndex, 1));
  return newList;
}

export function handleStateAdd<T extends ItemInterface>(
  normalized: Normalized<T>[],
  list: T[],
  evt?: Sortable.SortableEvent,
  clone?: ((currentItem: T, evt: Sortable.SortableEvent) => T) | undefined
): T[] {
  const newList = [...list];
  normalized.forEach(curr => {
    const newItem = (clone && evt) && clone(curr.item, evt); 
    newList.splice(curr.newIndex, 0, newItem || curr.item)
  });
  return newList;
}

export function getMode(evt: MultiDragEvent) {
  if (evt.oldIndicies && evt.oldIndicies.length > 0) return "multidrag";
  if (evt.swapItem) return "swap";
  return "normal";
}

export function createNormalized<T extends ItemInterface>(
  inputs: Input[],
  list: T[]
): Normalized<T>[] {
  const normalized = inputs
    .map<Normalized<T>>(curr => ({ ...curr, item: list[curr.oldIndex] }))
    .sort((a, b) => a.oldIndex - b.oldIndex);
  return normalized;
}

export interface Input {
  parentElement: HTMLElement;
  element: HTMLElement;
  oldIndex: number;
  newIndex: number;
}

export interface Normalized<T> extends Input {
  item: T;
}

/**
 * Removes the following group of properties from `props`,
 * leaving only `Sortable.Options` without any `on` methods.
 * @param props `ReactSortable.Props`
 */
export function destructurePropsForOptions<T>(
  props: PropsWithChildren<ReactSortableProps<T>>
): Exclude<Options, AllMethodNames> {
  const {
    // react sortable props
    list,
    setList,
    children,
    tag,
    style,
    className,
    clone,
    // sortable options that have methods we want to overwrite
    onAdd,
    onChange,
    onChoose,
    onClone,
    onEnd,
    onFilter,
    onRemove,
    onSort,
    onStart,
    onUnchoose,
    onUpdate,
    onMove,
    onSpill,
    onSelect,
    onDeselect,
    ...options
  } = props;
  return options;
}

/**
 * Construct a type with the properties of T except for those in type K.
 * Including this allows for backwards compatibility with earlier versions of TS.
 */
export type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;