import { DomUtil } from 'leaflet'

/**
 * Get individual classes from a CSS class string.
 * @param className The unparsed CSS class string
 * @returns a list of class names; there are no empty strings in it.
 */
function splitClassName(className: string): string[] {
  return className.split(' ').filter(Boolean)
}

/**
 * Apply classes to a (Leaflet) element.
 *
 * Each class is applied in turn by calling Leaflet's addClass function.
 *
 * @param element the element to change
 * @param className a string with zero or more classes sepparated by spaces.
 */
export function addClassName(element: HTMLElement, className: string) {
  splitClassName(className).forEach((cls) => {
    DomUtil.addClass(element, cls)
  })
}

/**
 * Remove classes from a (Leaflet) element.
 *
 * Each class is removed in turn by calling Leaflet's removeClass function.
 *
 * @param element the element to change
 * @param className a string with zero or more classes sepparated by spaces.
 */
export function removeClassName(element: HTMLElement, className: string) {
  splitClassName(className).forEach((cls) => {
    DomUtil.removeClass(element, cls)
  })
}

/**
 * Add and remove classes in a single call to/from a (Leaflet) element.
 * @param element the element to change
 * @param prevClassName a string with zero or more classes
 *        sepparated by spaces that should be removed.
 * @param nextClassName a string with zero or more classes
 *        sepparated by spaces that should be added.
 */
export function updateClassName(
  element?: HTMLElement,
  prevClassName?: string,
  nextClassName?: string,
) {
  if (element != null && nextClassName !== prevClassName) {
    if (prevClassName != null && prevClassName.length > 0) {
      removeClassName(element, prevClassName)
    }
    if (nextClassName != null && nextClassName.length > 0) {
      addClassName(element, nextClassName)
    }
  }
}
