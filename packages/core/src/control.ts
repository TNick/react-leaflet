import { Control, type ControlOptions } from 'leaflet'
import { useEffect, useRef } from 'react'

import { useLeafletContext } from './context.js'
import type { ElementHook } from './element.js'

/**
 * Creates a hook that creates and inserts the control.
 *
 * The position of the control on the map can be changed by changing the
 * property `position` on the resulted React element.
 *
 * @param useElement a hook produced by createElementHook()
 * @returns a hook that creates an element on first render and inserts it into the map
 */
export function createControlHook<E extends Control, P extends ControlOptions>(
  useElement: ElementHook<E, P>,
) {
  return function useLeafletControl(props: P): ReturnType<ElementHook<E, P>> {
    // Get the context that has our map.
    const context = useLeafletContext()
    // Invoke user hook to create the element; the result is a ref with
    // the created LeafletElement in its current property.
    // This will be forwarded as the result of this hook.
    const elementRef = useElement(props, context)

    const { instance } = elementRef.current
    // Save the current position.
    const { position } = props
    const positionRef = useRef(position)

    // On first render insert the control into the map.
    useEffect(
      function addControl() {
        // Insert this control into Leaflet map.
        instance.addTo(context.map)

        // And remove it when the component gets unmounted.
        return function removeControl() {
          instance.remove()
        }
      },
      [context.map, instance],
    )

    // When the position chenages in properties...
    useEffect(
      function updateControl() {
        if (position != null && position !== positionRef.current) {
          // move the control to the new position
          instance.setPosition(position)
          // and save new value for future reference.
          positionRef.current = position
        }
      },
      [instance, position],
    )

    return elementRef
  }
}
