import {
  LeafletProvider,
  type LeafletContextInterface,
  createLeafletContext,
} from '@react-leaflet/core'
import {
  type FitBoundsOptions,
  type LatLngBoundsExpression,
  Map as LeafletMap,
  type MapOptions,
} from 'leaflet'
import React, {
  type CSSProperties,
  type ReactNode,
  type Ref,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react'

/**
 * Properties expected by the MapContainer component.
 *
 * These include the options for Leaflet maps that are forwarded
 * to the inner map instance.
 */
export interface MapContainerProps extends MapOptions {
  /// The initial view; ignored if center and zoom members are set.
  /// Changing these values after first render has no effect.
  bounds?: LatLngBoundsExpression

  /// Options for the initial view.
  /// Changing these values after first render has no effect.
  boundsOptions?: FitBoundsOptions

  /// Nested inside LeafletProvider after the map is created.
  children?: ReactNode

  /// Passed to the outer div on which the map is created.
  className?: string

  /// The ID of the outer div on which the map is created.
  id?: string

  /// Rendered while the map is being constructed.
  /// It will be rendered at least once.
  placeholder?: ReactNode

  /// Passed to the outer div on which the map is created.
  style?: CSSProperties

  /// A user callback that gets triggered when the map has been created.
  whenReady?: () => void
}

/**
 * The MapContainer renders a container <div> element for the map.
 *
 * If the placeholder prop is set, it will be rendered inside the
 * container <div>.
 *
 * The MapContainer instantiates a Leaflet Map for the created
 * <div> with the component properties and creates the React
 * context containing the map instance.
 *
 * The MapContainer renders its children components. Each child
 * component instantiates the matching Leaflet instance for the
 * element using the component properties and context, and adds
 * it to the map.
 *
 * When a child component is rendered again, changes to its
 * supported mutable props are applied to the map. When a component
 * is removed from the render tree, it removes its layer
 * from the map as needed.
 */
function MapContainerComponent<
  Props extends MapContainerProps = MapContainerProps,
>(
  {
    bounds,
    boundsOptions,
    center,
    children,
    className,
    id,
    placeholder,
    style,
    whenReady,
    zoom,
    ...options
  }: Props,
  forwardedRef: Ref<LeafletMap | null>,
) {
  // Properties to be applied to the wrapping div.
  // By using useState we prevent the user from changing them
  // after first render.
  const [props] = useState({ className, id, style })

  // The value that we place into context.
  const [context, setContext] = useState<LeafletContextInterface | null>(null)

  // The caller has access to the map created by the Leaflet backend.
  useImperativeHandle(forwardedRef, () => context?.map ?? null, [context])

  // Receives the DOM node for the wrapper.
  const mapRef = useCallback((node: HTMLDivElement | null) => {
    if (node !== null && context === null) {
      // Create the map with the rest of the options.
      const map = new LeafletMap(node, options)

      // Set initial view.
      if (center != null && zoom != null) {
        map.setView(center, zoom)
      } else if (bounds != null) {
        map.fitBounds(bounds, boundsOptions)
      }

      // Trigger user callback,
      if (whenReady != null) {
        map.whenReady(whenReady)
      }

      // Create and save the context value.
      setContext(createLeafletContext(map))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // When the components unmounts the map gets removed.
  useEffect(() => {
    return () => {
      context?.map.remove()
    }
  }, [context])

  // On first render cycle will render the wrapping div with the
  // placeholder inside (if provided).
  // After the map is constructed and the context value was set
  // the children will be wrapped into a context provider
  // and the outside div.
  return (
    <div {...props} ref={mapRef}>
      {context ? (
        <LeafletProvider value={context}>{children}</LeafletProvider>
      ) : (
        placeholder ?? null
      )}
    </div>
  )
}

export const MapContainer = forwardRef(MapContainerComponent)
