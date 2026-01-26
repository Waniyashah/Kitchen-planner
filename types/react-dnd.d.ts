declare module 'react-dnd' {
  // Minimal declarations to satisfy TypeScript until proper types are available.
  export function useDrag(...args: any[]): any
  export function useDrop(...args: any[]): any
  export const DndProvider: any
  export const DragPreviewImage: any
  export const HTML5Backend: any
  export default any
}

declare module 'react-dnd-html5-backend' {
  export const HTML5Backend: any
}
