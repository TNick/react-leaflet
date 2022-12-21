import type {
  Control,
  ControlOptions,
  FeatureGroup,
  Layer,
  Path,
} from 'leaflet'

import {
  type PropsWithChildren,
  createContainerComponent,
  createDivOverlayComponent,
  createLeafComponent,
} from './component.js'
import type { LeafletContextInterface } from './context.js'
import { createControlHook } from './control.js'
import {
  type LeafletElement,
  createElementHook,
  createElementObject,
} from './element.js'
import { type LayerProps, createLayerHook } from './layer.js'
import {
  type DivOverlay,
  type DivOverlayLifecycleHook,
  createDivOverlayHook,
} from './div-overlay.js'
import { type PathProps, createPathHook } from './path.js'

/**
 * layer options that include the children property.
 */
interface LayerWithChildrenProps extends LayerProps, PropsWithChildren {}

/**
 * Path options that include the children property.
 */
interface PathWithChildrenProps extends PathProps, PropsWithChildren {}

/**
 * Creates a React component from a Leaflet Control.
 *
 * @example <caption>In your code you use the function like this:</caption>
 * import { createControlComponent } from '@react-leaflet/core'
 * import { Control } from 'leaflet'
 * export type AttributionControlProps = Control.AttributionOptions
 * export const AttributionControl = createControlComponent<
 *   Control.Attribution,
 *   AttributionControlProps
 * >(function createAttributionControl(props) {
 *   return new Control.Attribution(props)
 * })
 * @param createInstance a function that gets a set of properties and creates
 *        a leaflet control from them.
 * @returns a React component
 */
export function createControlComponent<
  E extends Control,
  P extends ControlOptions,
>(createInstance: (props: P) => E) {
  // The callback that receives properties and context as arguments.
  // It uses the user provided function to create the control,
  // then it creates a frozen object with three properties
  // called a LeafletElement:
  // - instance: the control that we just created,
  // - context, forwarded from callback and
  // - container which is undefined in this case.
  function createElement(
    props: P,
    context: LeafletContextInterface,
  ): LeafletElement<E> {
    return createElementObject(createInstance(props), context)
  }

  // We create a hook whick, on first render, will call
  // our createElement(), will store the element
  // in a ref.current, then will return the ref to the caller.
  // Just to be clear, useElement si the hook function and
  // it takes two arguments: props and context.
  const useElement = createElementHook(createElement)
  // We then create a hook that takes the result of the
  // above hook and adds to it the ability to change position.
  // The control is added to the map on first render and
  // is removed from the map in unmount.
  // The result of invoking the hook is the same as invoking
  // useElement above.
  const useControl = createControlHook(useElement)

  // We create a function component that can forward references
  // to its inner component.
  // The inner component will in turn invoke the hook
  // created above. It does not render anything.
  return createLeafComponent(useControl)
}

/**
 * Creates a react component representing a Leaflet layer.
 *
 * The created layer always has an attribution, may have event handlers
 * and is inserted and removed from the map automatically.
 *
 * @param createElement hook which creates the layer
 * @param updateElement hook which updates the layer
 * @returns a component that wraps its children in a context provider.
 */
export function createLayerComponent<
  E extends Layer,
  P extends LayerWithChildrenProps,
>(
  createElement: (
    props: P,
    context: LeafletContextInterface,
  ) => LeafletElement<E>,
  updateElement?: (instance: E, props: P, prevProps: P) => void,
) {
  // We create a hook whick, on first render, will call
  // our createElement(), will store the element
  // in a ref.current, then will return the ref to the caller.
  // Just to be clear, useElement si the hook function and
  // it takes two arguments: props and context.
  const useElement = createElementHook(createElement, updateElement)
  // Create a layer that has an attribution, may have event handlers
  // and is inserted and removed from the map automatically.
  const useLayer = createLayerHook(useElement)
  // Create the component that wraps its children in a context provider.
  return createContainerComponent(useLayer)
}

/**
 * Create a component that adds an overlay to Leaflet instance.
 *
 * @param createElement hook which creates the overlay
 * @param updateElement hook which updates the overlay
 * @returns a component that wraps its children in a context provider.
 */
export function createOverlayComponent<
  E extends DivOverlay,
  P extends LayerWithChildrenProps,
>(
  createElement: (
    props: P,
    context: LeafletContextInterface,
  ) => LeafletElement<E>,
  useLifecycle: DivOverlayLifecycleHook<E, P>,
) {
  // We create a hook whick, on first render, will call
  // our createElement(), will store the element
  // in a ref.current, then will return the ref to the caller.
  // Just to be clear, useElement si the hook function and
  // it takes two arguments: props and context.
  const useElement = createElementHook(createElement)

  // Make it an overlay.
  const useOverlay = createDivOverlayHook(useElement, useLifecycle)

  // The component that is created will have an internal open/close state.
  // The inner DivOverlay's update method gets called when the
  // open/close state changes.
  return createDivOverlayComponent(useOverlay)
}

/**
 * Create a component that adds a path to Leaflet instance.
 *
 * @param createElement hook which creates the path
 * @param updateElement hook which updates the path
 * @returns a component that wraps its children in a context provider.
 */
export function createPathComponent<
  E extends FeatureGroup | Path,
  P extends PathWithChildrenProps,
>(
  createElement: (
    props: P,
    context: LeafletContextInterface,
  ) => LeafletElement<E>,
  updateElement?: (instance: E, props: P, prevProps: P) => void,
) {
  // We create a hook whick, on first render, will call
  // our createElement(), will store the element
  // in a ref.current, then will return the ref to the caller.
  // Just to be clear, useElement si the hook function and
  // it takes two arguments: props and context.
  const useElement = createElementHook(createElement, updateElement)
  // Install event listners, if any; the hook will unmount them
  // on unmount; add the layer to the map and remove it on unmount;
  // automatically call setStyle on the path when pathOptions change.
  const usePath = createPathHook(useElement)
  // Create the component that wraps its children in a context provider.
  return createContainerComponent(usePath)
}

/**
 * Create a component that adds a tile layer to Leaflet instance.
 *
 * The created component is a leaf component (has no children).
 *
 * @param createElement hook which creates the layer
 * @param updateElement hook which updates the layer
 * @returns a React component that does not render anything
 */
export function createTileLayerComponent<E extends Layer, P extends LayerProps>(
  createElement: (
    props: P,
    context: LeafletContextInterface,
  ) => LeafletElement<E>,
  updateElement?: (instance: E, props: P, prevProps: P) => void,
) {
  // We create a hook whick, on first render, will call
  // our createElement(), will store the element
  // in a ref.current, then will return the ref to the caller.
  // Just to be clear, useElement si the hook function and
  // it takes two arguments: props and context.
  const useElement = createElementHook(createElement, updateElement)

  // Create a layer that has an attribution, may have event handlers
  // and is inserted and removed from the map automatically.
  const useLayer = createLayerHook(useElement)

  // We create a function component that can forward references
  // to its inner component.
  // The inner component will in turn invoke the hook
  // created above. It does not render anything.
  return createLeafComponent(useLayer)
}
