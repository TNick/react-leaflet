import type {
  Circle as LeafletCircle,
  CircleMarker as LeafletCircleMarker,
  CircleMarkerOptions,
  CircleOptions,
  LatLngExpression,
} from 'leaflet'
import type { ReactNode } from 'react'

import type { PathProps } from './path.js'

/**
 * Properties of a circle marker element.
 */
export interface CircleMarkerProps extends CircleMarkerOptions, PathProps {
  center: LatLngExpression
  children?: ReactNode
}

/**
 * Properties of a circle element.
 */
export interface CircleProps extends CircleOptions, PathProps {
  center: LatLngExpression
  children?: ReactNode
}

/**
 * An updater function suitable for createElementHook that updates the
 * properties of an Leaflet Circle when react properties change.
 *
 * The function manages two properties: center and radius.
 *
 * @param layer The circle that we're updating.
 * @param props The new set of properties.
 * @param prevProps The old set of properties.
 */
export function updateCircle<P extends CircleMarkerProps | CircleProps>(
  layer: LeafletCircle<P> | LeafletCircleMarker<P>,
  props: P,
  prevProps: P,
) {
  if (props.center !== prevProps.center) {
    layer.setLatLng(props.center)
  }
  if (props.radius != null && props.radius !== prevProps.radius) {
    layer.setRadius(props.radius)
  }
}
