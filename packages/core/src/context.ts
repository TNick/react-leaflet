import type { Control, Layer, LayerGroup, Map } from 'leaflet'
import { createContext, useContext } from 'react'

export const CONTEXT_VERSION = 1

export type ControlledLayer = {
  addLayer(layer: Layer): void
  removeLayer(layer: Layer): void
}

/**
 * The layout of the object placed into context.
 */
export type LeafletContextInterface = Readonly<{
  /// Should always be CONTEXT_VERSION.
  __version: number
  map: Map
  layerContainer?: ControlledLayer | LayerGroup
  layersControl?: Control.Layers
  overlayContainer?: Layer

  /// The closest pane. When creating a new pane the context will be
  /// cloned and this member will be replaced by the name of the
  /// current pane.
  /// The context at the top will have this member set to undefined.
  /// @see https://leafletjs.com/reference.html#map-pane
  pane?: string
}>

/**
 * The initial value placed in context.
 */
export function createLeafletContext(map: Map): LeafletContextInterface {
  return Object.freeze({ __version: CONTEXT_VERSION, map })
}

/**
 * A simple method that creates a new frozen object from the two inputs.
 */
export function extendContext(
  source: LeafletContextInterface,
  extra: Partial<LeafletContextInterface>,
): LeafletContextInterface {
  return Object.freeze({ ...source, ...extra })
}

/**
 * The context makes the map available at arbitrary
 * depths in React tree.
 */
export const LeafletContext = createContext<LeafletContextInterface | null>(
  null,
)

/**
 * The provider to use in the React tree.
 */
export const LeafletProvider = LeafletContext.Provider

/**
 * A hook to retrieve the LeafletContext values.
 */
export function useLeafletContext(): LeafletContextInterface {
  const context = useContext(LeafletContext)
  if (context == null) {
    throw new Error(
      'No context provided: useLeafletContext() can only be used in a descendant of <MapContainer>',
    )
  }
  return context
}
