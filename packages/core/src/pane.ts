import type { LayerOptions } from 'leaflet'

import type { LeafletContextInterface } from './context.js'

/**
 * Retrieves the pane name to use from props or from
 * context if not present in props. The result is
 * an object that has a pane key only if pane was defined
 * in either props or context.
 */
export function withPane<P extends LayerOptions>(
  props: P,
  context: LeafletContextInterface,
): P {
  const pane = props.pane ?? context.pane
  return pane ? { ...props, pane } : props
}
