import {
  type LeafletContextInterface,
  LeafletProvider,
  addClassName,
  useLeafletContext,
} from '@react-leaflet/core'
import React, {
  type CSSProperties,
  type ReactNode,
  type Ref,
  forwardRef,
  useState,
  useEffect,
  useImperativeHandle,
  useMemo,
} from 'react'
import { createPortal } from 'react-dom'

/**
 * These are the names predefined by Leaflet and, thus, reserved.
 */
const DEFAULT_PANES = [
  'mapPane',
  'markerPane',
  'overlayPane',
  'popupPane',
  'shadowPane',
  'tilePane',
  'tooltipPane',
]

/**
 * A function to remove the pane from an object.
 *
 * Used on component unmounting to remove the pane from
 * Leaflet's _panes and _paneRenderers map properties.
 */
function omitPane(obj: Record<string, unknown>, pane: string) {
  const { [pane]: _p, ...others } = obj
  return others
}

/**
 * Properties expected by a pane.
 */
export interface PaneProps {
  /// The inner elements to render inside the pane.
  children?: ReactNode

  /// The class that will be applied to the pane element
  /// created by Leaflet.
  className?: string

  /// The name of this pane. Avoid using one of the
  /// predefined names or a pane that has already been created.
  name: string

  /// The parent pane name. If empty the pane from
  /// the context will be used.
  pane?: string

  /// Styles to apply to the underlying DOM element.
  style?: CSSProperties
}

/**
 * Creates a pane in the Leaflet backend.
 *
 * The function creates a pane in the map stored in context.
 * User styles provided through className and style properties
 * are applied before returning the element.
 *
 * @param name the name of the pane to create;
 * @param props properties for the new pane;
 * @param context the map into which we're creating the pane.
 * @returns the DOM element created by Leaflet backend.
 * @see https://leafletjs.com/reference.html#map-pane
 */
function createPane(
  name: string,
  props: PaneProps,
  context: LeafletContextInterface,
): HTMLElement {
  // Make sure that the user is not using one of the reserved names.
  if (DEFAULT_PANES.indexOf(name) !== -1) {
    throw new Error(
      `You must use a unique name for a pane that is not a default Leaflet pane: ${name}`,
    )
  }
  // Make sure that the user is not recreating an exiisting pane.
  if (context.map.getPane(name) != null) {
    throw new Error(`A pane with this name already exists: ${name}`)
  }

  // Take the parent either from properties or from context
  // and retrieve that pae from leaflet backend.
  const parentPaneName = props.pane ?? context.pane
  const parentPane = parentPaneName
    ? context.map.getPane(parentPaneName)
    : undefined

  // Create the actual pane in the backend.
  const element = context.map.createPane(name, parentPane)

  // Apply user styling.
  if (props.className != null) {
    addClassName(element, props.className)
  }
  if (props.style != null) {
    Object.keys(props.style).forEach((key) => {
      // @ts-ignore
      element.style[key] = props.style[key]
    })
  }

  return element
}

/**
 * A leaflet map pane.
 *
 * The component will request Leaflet to create the underlying DOM element for
 * the pane, then it will create a react portal through that element.
 * Note that a new LeafletContext is created to wrap the children elements,
 * with the pane property replaced by the name of this pane.
 *
 * Panes are DOM elements used to control the ordering of layers on
 * the map. You can access panes in Leaflet with map.getPane or map.getPanes
 * methods. New panes can be created in Leaflet with the map.createPane method.
 *
 * Every map has the following default panes that differ only in zIndex:
 *
 *     Pane         Type      Z-index              Description
 * - mapPane     HTMLElement	 'auto'    Pane that contains all other map panes
 * - tilePane    HTMLElement	 200       Pane for GridLayers and TileLayers
 * - overlayPane HTMLElement	 400       Pane for vectors (Paths, like Polylines and Polygons),
 *                                       ImageOverlays and VideoOverlays
 * - shadowPane  HTMLElement	 500       Pane for overlay shadows (e.g. Marker shadows)
 * - markerPane  HTMLElement	 600       Pane for Icons of Markers
 * - tooltipPane HTMLElement	 650       Pane for Tooltips.
 * - popupPane   HTMLElement	 700       Pane for Popups.
 *
 * Note that changing the name property in subsequent renders
 * will be ignored.
 *
 * @see https://leafletjs.com/reference.html#map-pane
 */
function PaneComponent(
  props: PaneProps,
  forwardedRef: Ref<HTMLElement | null>,
) {
  // Prevent the user from changing the name of the pane.
  const [paneName] = useState(props.name)

  // This is where we stopre a reference to the elementcreated by the
  // Leaflet backend.
  const [paneElement, setPaneElement] = useState<HTMLElement | null>(null)

  // The caller has access to the element created by the Leaflet backend.
  useImperativeHandle(forwardedRef, () => paneElement, [paneElement])

  // Get the context and derive a new context from it but with
  // the pane name set to the one we're creating here.
  const context = useLeafletContext()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const newContext = useMemo(() => ({ ...context, pane: paneName }), [context])

  // On first render create the element in the backend
  useEffect(() => {
    setPaneElement(createPane(paneName, props, context))

    // On unmount remove the pane from Leaflet.
    return function removeCreatedPane() {
      const pane = context.map.getPane(paneName)
      pane?.remove?.()

      // @ts-ignore map internals
      if (context.map._panes != null) {
        // @ts-ignore map internals
        context.map._panes = omitPane(context.map._panes, paneName)
        // @ts-ignore map internals
        context.map._paneRenderers = omitPane(
          // @ts-ignore map internals
          context.map._paneRenderers,
          paneName,
        )
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // On first render the pane will not render as useEffect is only called
  // at the end of the rendering cycle.
  // We're creating a new context for the children of the pane
  // with the pane property set to current pane name.
  return props.children != null && paneElement != null
    ? createPortal(
        <LeafletProvider value={newContext}>{props.children}</LeafletProvider>,
        paneElement,
      )
    : null
}

export const Pane = forwardRef(PaneComponent)
