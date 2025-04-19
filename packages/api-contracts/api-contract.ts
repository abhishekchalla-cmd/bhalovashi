import z from "zod";
import { AxiosInstance } from "axios";

export const METHOD = {
  GET: "get",
  POST: "post",
  PUT: "put",
  DELETE: "delete",
  PATCH: "patch",
} as const;

export type Method = (typeof METHOD)[keyof typeof METHOD];

class ApiContract<
  M extends Method,
  EPSchema extends z.AnyZodObject,
  EP extends
    | string
    | {
        endpointParamsSchema: EPSchema;
        getEndpoint: (params: z.infer<EPSchema>) => string;
      },
  RT extends z.ZodSchema,
  QP extends z.AnyZodObject | undefined = undefined,
  D extends z.ZodSchema | undefined = undefined,
> {
  constructor(
    public readonly method: M,
    public readonly endpoint: EP,
    public readonly returnType: RT,
    public readonly queryParams?: QP,
    public readonly data?: D
  ) {}

  makeRequest(
    axiosInstance: AxiosInstance,
    args: (EP extends string
      ? {}
      : EP extends {
            endpointParamsSchema: EPSchema;
            getEndpoint: (params: z.infer<EPSchema>) => string;
          }
        ? {
            endpointParams: z.infer<EP["endpointParamsSchema"]>;
          }
        : {}) &
      (QP extends undefined
        ? {}
        : QP extends z.AnyZodObject
          ? { queryParams: z.infer<QP> }
          : {}) &
      (D extends undefined
        ? {}
        : D extends z.AnyZodObject
          ? { data: z.infer<D> }
          : {})
  ): Promise<z.infer<RT>> {
    const url =
      typeof this.endpoint === "string"
        ? this.endpoint
        : this.endpoint.getEndpoint((args as any).endpointParams!);

    return axiosInstance({
      method: this.method,
      url,
      params: (args as any).queryParams,
      data: (args as any).data,
    }).then(({ data }) => data);
  }
}

export default ApiContract;
