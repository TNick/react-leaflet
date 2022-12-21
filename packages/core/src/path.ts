import type { FeatureGroup, Path, PathOptions } from 'leaflet'
import { useEffect, useRef } from 'react'

import { useLeafletContext } from './context.js'
import type { LeafletElement, ElementHook } from './element.js'
import { useEventHandlers } from './events.js'
import { type InteractiveLayerProps, useLayerLifecycle } from './layer.js'
import { withPane } from './pane.js'

/**
 * Properties expected by the usePathOptions function.
 */
export interface PathProps extends InteractiveLayerProps {
  pathOptions?: PathOptions
}

/**
 * The hook watches the pathOptions member of the properties and invokes
 * the setStyle() method of the path when they change.
 *
 * @param element The target element
 * @param props Current properties.
 */
export function usePathOptions(
  element: LeafletElement<FeatureGroup | Path>,
  props: PathProps,
) {
  // This is where we store the value of the properties
  // across the renders.
  const optionsRef = useRef<PathOptions | void>()

  // When the properties of the paths change...
  useEffect(
    function updatePathOptions() {
      if (props.pathOptions !== optionsRef.current) {
        const options = props.pathOptions ?? {}
        // update the style of the path
        element.instance.setStyle(options)
        optionsRef.current = options
      }
    },
    [element, props],
  )
}

/**
 * Creates a path component.
 */
export function createPathHook<
  E extends FeatureGroup | Path,
  P extends PathProps,
>(useElement: ElementHook<E, P>) {
  return function usePath(props: P): ReturnType<ElementHook<E, P>> {
    // Get values from the context.
    const context = useLeafletContext()
    // Create the element.
    const elementRef = useElement(withPane(props, context), context)

    // Install event listners, if any; the hook will unmount them
    // on unmount.
    useEventHandlers(elementRef.current, props.eventHandlers)
    // Add the layer to the map and remove it on unmount.
    useLayerLifecycle(elementRef.current, context)
    // Automatically call setStyle on the path when pathOptions change.
    usePathOptions(elementRef.current, props)

    return elementRef
  }
}
