/** Every JSON answer of the API uses this shape. */
export interface ApiEnvelope<T> {
  message: string
  data: T
  success: boolean
}
