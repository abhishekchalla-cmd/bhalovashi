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
  EP extends z.AnyZodObject = z.ZodObject<{ [paramName: string]: z.ZodString }>,
  RT extends z.AnyZodObject = z.AnyZodObject,
  QP extends z.AnyZodObject = z.ZodObject<{ [paramName: string]: z.ZodString }>,
  D extends z.AnyZodObject = z.AnyZodObject,
> {
  constructor(
    public readonly method: M,
    public readonly endpoint:
      | string
      | {
          endpointParamsSchema: EP;
          getEndpoint: (params: z.infer<EP>) => string;
        },
    public readonly returnType: RT,
    public readonly queryParams?: QP,
    public readonly data?: D
  ) {}

  makeRequest(
    axiosInstance: AxiosInstance,
    args: (EP extends string ? {} : { endpointParams: z.infer<EP> }) &
      (QP extends undefined ? {} : { queryParams: z.infer<QP> }) &
      (D extends undefined ? {} : { data: z.infer<D> })
  ): z.infer<RT> {
    return axiosInstance({
      method: this.method,
      url:
        typeof this.endpoint === "string"
          ? this.endpoint
          : this.endpoint.getEndpoint(args.endpointParams),
      params: args.queryParams,
      data: args.data,
    }).then(({ data }) => data);
  }
}

export default ApiContract;
