export interface ILayoutDynamicsFunctions {
  [key: string]: (arg1:string, arg2:string) => boolean;
}

export interface ILayoutDynamicsAliases {
  [key: string]: string[];
}

export interface ILayoutDynamicsDataModelArg {
  dataModel: string;
}

export interface ILayoutDynamicsComponentArg {
  component: string;
}

export type ILayoutDynamicsArg = string | ILayoutDynamicsDataModelArg | ILayoutDynamicsComponentArg;

export interface ILayoutDynamicsExpr {
  function: string;
  args?: ILayoutDynamicsArg[];
}
