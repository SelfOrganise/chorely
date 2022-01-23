export interface Response {
  code: number;
  data?: string | Object;
}

export function response(code: number, data?: string | Object): Response {
  return {
    code,
    data,
  };
}
