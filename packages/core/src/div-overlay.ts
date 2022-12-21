import type { Popup, Tooltip } from 'leaflet'

import { useAttribution } from './attribution.js'
import { useLeafletContext, type LeafletContextInterface } from './context.js'
import type { LeafletElement, ElementHook } from './element.js'
import { useEventHandlers } from './events.js'
import type { LayerProps } from './layer.js'
import { withPane } from './pane.js'

export type DivOverlay = Popup | Tooltip

export type SetOpenFunc = (open: boolean) => void

export type DivOverlayLifecycleHook<E, P> = (
  element: LeafletElement<E>,
  context: LeafletContextInterface,
  props: P,
  setOpen: SetOpenFunc,
) => void

export type DivOverlayHook<E extends DivOverlay, P> = (
  useElement: ElementHook<E, P>,
  useLifecycle: DivOverlayLifecycleHook<E, P>,
) => (props: P, setOpen: SetOpenFunc) => ReturnType<ElementHook<E, P>>

/**
 * Create a hook for working with overlays.
 *
 * @param useElement the upstream hook that creates the element
 * @param useLifecycle life-cycle upstream hook
 * @returns a hook that can be used to create n overlay
 */
export function createDivOverlayHook<
  E extends DivOverlay,
  P extends LayerProps,
>(useElement: ElementHook<E, P>, useLifecycle: DivOverlayLifecycleHook<E, P>) {
  return function useDivOverlay(
    props: P,
    setOpen: SetOpenFunc,
  ): ReturnType<ElementHook<E, P>> {
    // Get global data.
    const context = useLeafletContext()

    // Create the actual element.
    const elementRef = useElement(withPane(props, context), context)

    // Watch the attribution property and update the map as required.
    useAttribution(context.map, props.attribution)
    // Install event handlers if the juser wants any.
    useEventHandlers(elementRef.current, props.eventHandlers)
    useLifecycle(elementRef.current, context, props, setOpen)

    return elementRef
  }
}
