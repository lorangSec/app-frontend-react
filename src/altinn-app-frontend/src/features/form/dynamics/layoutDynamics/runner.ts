import { ILayouts, ILayoutComponent, ILayoutGroup } from "src/features/form/layout";
import { IFormData } from "src/features/form/data/formDataReducer";
import { IRepeatingGroups } from "src/types";
import { ILayoutDynamicsExpr } from "src/features/form/dynamics/layoutDynamics/types";
import { iterateFieldsInLayout } from "src/utils/validation";

export function runLayoutDynamics(
  findExpr:(component:ILayoutComponent|ILayoutGroup)=>undefined|boolean|ILayoutDynamicsExpr,
  layouts:ILayouts,
  formData:IFormData,
  repeatingGroups:IRepeatingGroups,
):string[] {
  const out:string[] = [];

  for (const layout of Object.values(layouts)) {
    for (const component of iterateFieldsInLayout(layout, [], repeatingGroups)) {
      console.log(component);

      // TODO: Implement
    }
  }

  return out;
}
