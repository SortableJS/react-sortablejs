import { PropsWithChildren } from "react";
import Sortable, { Options } from "sortablejs";
import { MultiDragEvent } from "./react-sortable";
import { AllMethodNames, ItemInterface, ReactSortableProps } from "./types";
/**
 * Removes the `node` from the DOM
 * @param node
 */
export declare function removeNode(node: HTMLElement): void;
/**
 * Inserts the `newChild` node at the given index in a parent
 * @param parent The parent HTML Element.
 * @param newChild A HTML eement to add as a child of the parent.
 * @param index index of the parent to place the new child in.
 */
export declare function insertNodeAt(parent: HTMLElement, newChild: HTMLElement, index: number): void;
/** removes stuff from the dom in a nice order */
export declare function handleDOMChanges<T extends ItemInterface>(customs: Normalized<T>[]): void;
export declare function removeNodes<T extends ItemInterface>(customs: Normalized<T>[]): void;
export declare function insertNodes<T extends ItemInterface>(customs: Normalized<T>[]): void;
export declare function createCustoms<T extends ItemInterface>(evt: MultiDragEvent, list: T[]): Normalized<T>[];
/** moves items form old index to new index without breaking anything ideally. */
export declare function handleStateChanges<T extends ItemInterface>(normalized: Normalized<T>[], list: T[]): T[];
export declare function handleStateRemove<T extends ItemInterface>(normalized: Normalized<T>[], list: T[]): T[];
export declare function handleStateAdd<T extends ItemInterface>(normalized: Normalized<T>[], list: T[], evt?: Sortable.SortableEvent,
    clone?: ((currentItem: T, evt: Sortable.SortableEvent) => T) | undefined): T[];
export declare function getMode(evt: MultiDragEvent): "multidrag" | "swap" | "normal";
export declare function createNormalized<T extends ItemInterface>(inputs: Input[], list: T[]): Normalized<T>[];
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
export declare function destructurePropsForOptions<T>(props: PropsWithChildren<ReactSortableProps<T>>): Exclude<Options, AllMethodNames>;
/**
 * Construct a type with the properties of T except for those in type K.
 * Including this allows for backwards compatibility with earlier versions of TS.
 */
export declare type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
//# sourceMappingURL=util.d.ts.map