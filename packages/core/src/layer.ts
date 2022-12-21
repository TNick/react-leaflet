import type { InteractiveLayerOptions, Layer, LayerOptions } from 'leaflet'
import { useEffect } from 'react'

import { useAttribution } from './attribution.js'
import { type LeafletContextInterface, useLeafletContext } from './context.js'
import type { LeafletElement, ElementHook } from './element.js'
import { type EventedProps, useEventHandlers } from './events.js'
import { withPane } from './pane.js'

export interface LayerProps extends EventedProps, LayerOptions {}
export interface InteractiveLayerProps
  extends LayerProps,
    InteractiveLayerOptions {}

/**
 * A hook that adds the layer to the container and removes
 * it on component unmount.
 *
 * If a layer container is set in context then the layer is added there.
 * Otherwise it gets added to the map directly.
 *
 * @param element The instance holds the layer to add
 * @param context The context of this operation.
 */
export function useLayerLifecycle(
  element: LeafletElement<Layer>,
  context: LeafletContextInterface,
) {
  useEffect(
    function addLayer() {
      // Insert the layer on first render.
      const container = context.layerContainer ?? context.map
      container.addLayer(element.instance)

      // Remove it on unmount.
      return function removeLayer() {
        context.layerContainer?.removeLayer(element.instance)
        context.map.removeLayer(element.instance)
      }
    },
    [context, element],
  )
}

/**
 * A hook for creating layers.
 *
 * The created layer always has an attribution, may have event handlers
 * and is inserted and removed from the map automatically.
 *
 * @param useElement the hook that actually creates the layer.
 * @returns the ref created by the provided useElement
 */
export function createLayerHook<E extends Layer, P extends LayerProps>(
  useElement: ElementHook<E, P>,
) {
  return function useLayer(props: P): ReturnType<ElementHook<E, P>> {
    // Retrieve context value.
    const context = useLeafletContext()
    // Get the element from upstream hook.
    const elementRef = useElement(withPane(props, context), context)

    // Watch the attribution property and update the map as required.
    useAttribution(context.map, props.attribution)
    // Install event handlers if the juser wants any.
    useEventHandlers(elementRef.current, props.eventHandlers)
    // Add the layer to the map and remove it on unmount.
    useLayerLifecycle(elementRef.current, context)

    return elementRef
  }
}
