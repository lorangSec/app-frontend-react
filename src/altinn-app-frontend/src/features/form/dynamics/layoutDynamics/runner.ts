import { ILayouts, ILayoutComponent, ILayoutGroup } from "src/features/form/layout";
import { IFormData } from "src/features/form/data/formDataReducer";
import { IRepeatingGroups } from "src/types";
import { ILayoutDynamicsExpr } from "src/features/form/dynamics/layoutDynamics/types";
import { IteratedComponent, iterateFieldsAndGroupsInLayout } from "src/utils/validation";

export function runLayoutDynamics(
  findExpr:(component:ILayoutComponent|ILayoutGroup)=>undefined|boolean|ILayoutDynamicsExpr,
  layouts:ILayouts,
  formData:IFormData,
  repeatingGroups:IRepeatingGroups,
):string[] {
  const out:string[] = [];

  for (const layout of Object.values(layouts)) {
    for (const component of iterateFieldsAndGroupsInLayout(layout, repeatingGroups)) {
      const maybeExpr = findExpr(component.component);
      if (typeof maybeExpr === 'undefined') {
        continue;
      }

      if (typeof maybeExpr === 'boolean' && maybeExpr) {
        out.push(component.component.id);
      } else if (typeof maybeExpr === 'object') {
        const result = runLayoutExpression(maybeExpr as ILayoutDynamicsExpr, formData, component);
        if (result) {
          out.push(component.component.id);
        }
      }
    }
  }

  return out;
}

function runLayoutExpression(
  expr: ILayoutDynamicsExpr,
  formData: IFormData,
  component: IteratedComponent<ILayoutComponent | ILayoutGroup>,
): boolean {
  console.log(expr, formData, component);
  return false;
}
