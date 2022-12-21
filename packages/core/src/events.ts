import type { Evented, LeafletEventHandlerFnMap } from 'leaflet'
import { useEffect, useRef } from 'react'

import type { LeafletElement } from './element.js'

export type EventedProps = {
  eventHandlers?: LeafletEventHandlerFnMap
}

/**
 * Adds a set of type/listener pairs, e.g. {click: onClick,
 * mousemove: onMouseMove}.
 *
 * On mount an on change the handlers are installed, on unmount they
 * are removed from underlying map.
 *
 * @param element we ponly use the instance from the element
 * @param eventHandlers the handlers to install
 */
export function useEventHandlers(
  element: LeafletElement<Evented>,
  eventHandlers: LeafletEventHandlerFnMap | null | undefined,
) {
  const eventHandlersRef = useRef<LeafletEventHandlerFnMap | null | undefined>()

  useEffect(
    function addEventHandlers() {
      // Install them and save them.
      if (eventHandlers != null) {
        element.instance.on(eventHandlers)
      }
      eventHandlersRef.current = eventHandlers

      // Remove the handlers on unmount.
      return function removeEventHandlers() {
        if (eventHandlersRef.current != null) {
          element.instance.off(eventHandlersRef.current)
        }
        eventHandlersRef.current = null
      }
    },
    [element, eventHandlers],
  )
}
