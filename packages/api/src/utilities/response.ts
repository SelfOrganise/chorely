export interface BaseResponse<T> {
  code: number;
  data?: T;
}

type EmptyResponse = BaseResponse<void>;
type StringResponse = BaseResponse<string>;

export type Response<T> = EmptyResponse | StringResponse | BaseResponse<T>;

export function response<T = void>(code: number, data?: T): Response<T> {
  return {
    code,
    data,
  };
}
