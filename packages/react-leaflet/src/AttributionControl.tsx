import { createControlComponent } from '@react-leaflet/core'
import { Control } from 'leaflet'

/**
 * Properties expected by the AttributionControl component
 * are identical to those of the underlying Attribution
 * from Leaflet.
 */
export type AttributionControlProps = Control.AttributionOptions

/**
 * Wraps the Leaflet's Attribution control to be usable in React.
 *
 * @see https://leafletjs.com/reference.html#control-attribution
 */
export const AttributionControl = createControlComponent<
  Control.Attribution,
  AttributionControlProps
>(function createAttributionControl(props) {
  return new Control.Attribution(props)
})
