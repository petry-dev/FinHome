declare module '*.png' {
  import type { StaticImageData } from 'next/image'
  const value: StaticImageData
  export default value
}

declare module '*.svg' {
  const value: string
  export default value
}
