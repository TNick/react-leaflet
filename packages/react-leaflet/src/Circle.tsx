import {
  type CircleProps,
  createElementObject,
  createPathComponent,
  extendContext,
  updateCircle,
} from '@react-leaflet/core'
import { Circle as LeafletCircle } from 'leaflet'

export type { CircleProps } from '@react-leaflet/core'

/**
 * Wraps the Leaflet's Circle control to be usable in React.
 *
 * @see https://leafletjs.com/reference.html#circle
 */
export const Circle = createPathComponent<LeafletCircle, CircleProps>(
  function createCircle({ center, children: _c, ...options }, ctx) {
    const circle = new LeafletCircle(center, options)
    return createElementObject(
      circle,
      extendContext(ctx, { overlayContainer: circle }),
    )
  },
  updateCircle,
)
