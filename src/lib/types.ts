export type ActionResponse<T = void> = {
  success: boolean;
  message: string;
  data?: T;
}