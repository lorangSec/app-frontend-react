import { ILayouts, ILayoutComponent, ILayoutGroup } from "src/features/form/layout";
import { IFormData } from "src/features/form/data/formDataReducer";
import { IRepeatingGroups } from "src/types";
import { ILayoutDynamicsExpr } from "src/features/form/dynamics/layoutDynamics/types";

export function runLayoutDynamics(
  findExpr:(component:ILayoutComponent|ILayoutGroup)=>undefined|boolean|ILayoutDynamicsExpr,
  layouts:ILayouts,
  formData:IFormData,
  repeatingGroups:IRepeatingGroups,
):string[] {
  // TODO: Iterate form layout
}
