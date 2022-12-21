import React, {
  type MutableRefObject,
  type ReactNode,
  type Ref,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react'
import { createPortal } from 'react-dom'

import { LeafletProvider } from './context.js'
import type { DivOverlay, DivOverlayHook } from './div-overlay.js'
import type { LeafletElement } from './element.js'

type ElementHook<E, P> = (props: P) => MutableRefObject<LeafletElement<E>>

/**
 * A simple interface that describes an object with one optional
 * property: the children.
 */
export type PropsWithChildren = {
  children?: ReactNode
}

/**
 * Create a component that wraps its children in a context provider.
 *
 * The value for the context is taken from the upstream hook's 'result.
 *
 * The inner instance representing the element that was created
 * is made available through the ref.
 *
 * @param useElement The upstream hook.
 * @returns a forward-reffed component
 */
export function createContainerComponent<E, P extends PropsWithChildren>(
  useElement: ElementHook<E, P>,
) {
  function ContainerComponent(props: P, forwardedRef: Ref<E>) {
    const { instance, context } = useElement(props).current
    useImperativeHandle(forwardedRef, () => instance)

    return props.children == null ? null : (
      <LeafletProvider value={context}>{props.children}</LeafletProvider>
    )
  }

  return forwardRef(ContainerComponent)
}

/**
 * Create a component that has an internal open/close state.
 *
 * The inner DivOverlay's update method gets called when the
 * open/close state changes.
 *
 * If there is a content node in the inner DivOverlay then a portal is created
 * through it and the children will be rendered there.
 * @param useElement The upstream hook that creates the DivOverlay
 * @returns a forward-referenced component
 */
export function createDivOverlayComponent<
  E extends DivOverlay,
  P extends PropsWithChildren,
>(useElement: ReturnType<DivOverlayHook<E, P>>) {
  function OverlayComponent(props: P, forwardedRef: Ref<E>) {
    const [isOpen, setOpen] = useState(false)
    const { instance } = useElement(props, setOpen).current

    useImperativeHandle(forwardedRef, () => instance)
    useEffect(
      function updateOverlay() {
        if (isOpen) {
          instance.update()
        }
      },
      [instance, isOpen, props.children],
    )

    // @ts-ignore _contentNode missing in type definition
    const contentNode = instance._contentNode
    return contentNode ? createPortal(props.children, contentNode) : null
  }

  return forwardRef(OverlayComponent)
}

/**
 * Create a component that has exports inner Leaflet element
 * through the forward reference mechanism of React.
 *
 * The component does not render anything.
 *
 * @param useElement A hook that can create LeafletElement objects.
 * @returns a forward-referenced component
 */
export function createLeafComponent<E, P>(useElement: ElementHook<E, P>) {
  function LeafComponent(props: P, forwardedRef: Ref<E>) {
    const { instance } = useElement(props).current
    useImperativeHandle(forwardedRef, () => instance)

    return null
  }

  return forwardRef(LeafComponent)
}
