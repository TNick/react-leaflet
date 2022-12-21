import type { GridLayer, GridLayerOptions } from 'leaflet'

/**
 * The hook watches and forwards to Leaflet instance
 * the opacity and zIndex properties.
 *
 * @param layer The target layer
 * @param props The properties for the layer
 * @param prevProps Previous set of properties
 */
export function updateGridLayer<
  E extends GridLayer,
  P extends GridLayerOptions,
>(layer: E, props: P, prevProps: P) {
  const { opacity, zIndex } = props
  if (opacity != null && opacity !== prevProps.opacity) {
    layer.setOpacity(opacity)
  }
  if (zIndex != null && zIndex !== prevProps.zIndex) {
    layer.setZIndex(zIndex)
  }
}
