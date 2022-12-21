import type { Map } from 'leaflet'
import { useEffect, useRef } from 'react'

/**
 * Updates the map with the attribution from argument.
 *
 * The hook keeps track of the current sttribution and will
 * trigger the appropriate removeAttribution/addAttribution
 * calls to the Leaflet map.
 *
 * @param map The map to update.
 * @param attribution The new attribution string to set.
 */
export function useAttribution(
  map: Map,
  attribution: string | null | undefined,
) {
  const attributionRef = useRef(attribution)

  useEffect(
    // When the attribution changes...
    function updateAttribution() {
      if (
        attribution !== attributionRef.current &&
        map.attributionControl != null
      ) {
        // remove previous one and
        if (attributionRef.current != null) {
          map.attributionControl.removeAttribution(attributionRef.current)
        }
        // set the new one.
        if (attribution != null) {
          map.attributionControl.addAttribution(attribution)
        }
      }
      attributionRef.current = attribution
    },
    [map, attribution],
  )
}
