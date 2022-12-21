import {
  LatLngBounds,
  type LatLngBoundsExpression,
  type ImageOverlay as LeafletImageOverlay,
  type ImageOverlayOptions,
  type SVGOverlay as LeafletSVGOverlay,
  type VideoOverlay as LeafletVideoOverlay,
} from 'leaflet'

import type { InteractiveLayerProps } from './layer.js'

export interface MediaOverlayProps
  extends ImageOverlayOptions,
    InteractiveLayerProps {
  bounds: LatLngBoundsExpression
}

/**
 * A function that updates the target element when bounds, opacity or
 * zIndex properties change.
 *
 * @param overlay The target element.
 * @param props The current set of properties.
 * @param prevProps The previous set of properties.
 */
export function updateMediaOverlay<
  E extends LeafletImageOverlay | LeafletSVGOverlay | LeafletVideoOverlay,
  P extends MediaOverlayProps,
>(overlay: E, props: P, prevProps: P) {
  if (
    props.bounds instanceof LatLngBounds &&
    props.bounds !== prevProps.bounds
  ) {
    overlay.setBounds(props.bounds)
  }
  if (props.opacity != null && props.opacity !== prevProps.opacity) {
    overlay.setOpacity(props.opacity)
  }
  if (props.zIndex != null && props.zIndex !== prevProps.zIndex) {
    // @ts-ignore missing in definition but inherited from ImageOverlay
    overlay.setZIndex(props.zIndex)
  }
}
