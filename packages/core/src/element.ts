import { type MutableRefObject, useEffect, useRef } from 'react'

import type { LeafletContextInterface } from './context.js'

export type LeafletElement<T, C = any> = Readonly<{
  instance: T
  context: LeafletContextInterface
  container?: C | null
}>

/**
 * Creates a frozen object out of arguments that confirms to the
 * LeafletElement type.
 */
export function createElementObject<T, C = any>(
  instance: T,
  context: LeafletContextInterface,
  container?: C | null,
): LeafletElement<T, C> {
  return Object.freeze({ instance, context, container })
}

/**
 * The description of our hooks.
 */
export type ElementHook<E, P> = (
  props: P,
  context: LeafletContextInterface,
) => MutableRefObject<LeafletElement<E>>

/**
 * Creates a hook for creating an element.
 *
 * @param createElement a function that can create a LeafletElement
 *        out of properties and, sometimes, a context.
 * @param updateElement an optionsl function that will do updates
 *        on that element.
 * @returns a hook that creates an element on first render
 */
export function createElementHook<E, P, C = any>(
  createElement: (
    props: P,
    context: LeafletContextInterface,
  ) => LeafletElement<E>,
  updateElement?: (instance: E, props: P, prevProps: P) => void,
) {
  // An element that cannot be updated.
  if (updateElement == null) {
    return function useImmutableLeafletElement(
      props: P,
      context: LeafletContextInterface,
    ): ReturnType<ElementHook<E, P>> {
      // This is where we will store the element that we create on first render.
      const elementRef = useRef<LeafletElement<E, C>>() as MutableRefObject<
        LeafletElement<E>
      >
      // On first render invoke the function that creates the element
      // and store it in returned ref.
      if (!elementRef.current)
        elementRef.current = createElement(props, context)
      return elementRef
    }
  }

  // An element that can be updated.
  return function useMutableLeafletElement(
    props: P,
    context: LeafletContextInterface,
  ): ReturnType<ElementHook<E, P>> {
    // This is where we will store the element that we create on first render.
    const elementRef = useRef<LeafletElement<E, C>>() as MutableRefObject<
      LeafletElement<E>
    >
    // On first render invoke the function that creates the element
    // and store it in returned ref.
    if (!elementRef.current) elementRef.current = createElement(props, context)

    // We store the initial properties in a second ref.
    const propsRef = useRef<P>(props)
    const { instance } = elementRef.current

    // When the properties change we invoke the update function,
    // then we store the new properties for future reference.
    useEffect(
      function updateElementProps() {
        if (propsRef.current !== props) {
          updateElement(instance, props, propsRef.current)
          propsRef.current = props
        }
      },
      [instance, props, context],
    )

    return elementRef
  }
}
