import { ILayouts, ILayoutComponent, ILayoutGroup } from "src/features/form/layout";
import { IFormData } from "src/features/form/data/formDataReducer";
import { IRepeatingGroups } from "src/types";
import {
  ILayoutDynamicsExpr,
  ILayoutDynamicsArg,
  ILayoutDynamicsDataModelArg,
  ILayoutDynamicsInstanceContextArg,
  ILayoutDynamicsApplicationSettingsArg
} from "src/features/form/dynamics/layoutDynamics/types";
import { iterateFieldsAndGroupsInLayout } from "src/utils/validation";
import { layoutDynamicsFunctions } from "src/features/form/dynamics/layoutDynamics/functions";
import { IApplicationSettings, IInstanceContext } from "altinn-shared/types";

export function runLayoutDynamics(
  findExpr: (component: ILayoutComponent | ILayoutGroup) => undefined | boolean | ILayoutDynamicsExpr,
  layouts: ILayouts,
  formData: IFormData,
  instanceContext: IInstanceContext,
  applicationSettings: IApplicationSettings,
  repeatingGroups: IRepeatingGroups,
): string[] {
  const out: string[] = [];

  for (const layout of Object.values(layouts)) {
    for (const component of iterateFieldsAndGroupsInLayout(layout.data.layout, repeatingGroups)) {
      const maybeExpr = findExpr(component.component);
      if (typeof maybeExpr === 'undefined') {
        continue;
      }

      if (typeof maybeExpr === 'boolean' && maybeExpr) {
        out.push(component.component.id);
      } else if (typeof maybeExpr === 'object') {
        const result = runLayoutExpression(maybeExpr as ILayoutDynamicsExpr, formData, instanceContext, applicationSettings);
        if (result) {
          out.push(component.component.id);
        }
      }
    }
  }

  return out;
}

export function runDynamicsForLayouts(
  layouts: ILayouts,
  formData: IFormData,
  instanceContext: IInstanceContext,
  applicationSettings: IApplicationSettings,
): string[] {
  const out: string[] = [];

  Object.keys(layouts).forEach((layout) => {
    const hidden = layouts[layout].hidden2; // TODO: rename to hidden
    if (hidden) {
      const result = runLayoutExpression(hidden, formData, instanceContext, applicationSettings);
      if (result) {
        out.push(layout);
      }
    }
  });
  return out;
}

function runLayoutExpression(
  expr: ILayoutDynamicsExpr,
  formData: IFormData,
  instanceContext: IInstanceContext,
  applicationSettings: IApplicationSettings,
  // component: IteratedComponent<ILayoutComponent | ILayoutGroup>,
): boolean {
  const computedArgs = (expr.args || []).map((arg) => resolveArgument(arg, formData, instanceContext, applicationSettings));
  return layoutDynamicsFunctions[expr.function].apply(null, computedArgs);
}

function resolveArgument(arg: ILayoutDynamicsArg, formData: IFormData, instanceContext: IInstanceContext, applicationSettings): string | undefined {
  if (typeof arg === 'string') {
    return arg;
  }

  if (isDataModelArg(arg)) {
    return formData[arg.dataModel];
  }

  if (isInstanceContextArg(arg)) {
    return instanceContext[arg.instanceContext];
  }

  if (isApplicationSettingsArg(arg)) {
    return applicationSettings[arg.applicationSettings];
  }

  // TODO: Resolve component references
  throw new Error('Not implemented');
}

function isDataModelArg(arg: ILayoutDynamicsArg): arg is ILayoutDynamicsDataModelArg {
  return typeof arg === 'object' && 'dataModel' in arg;
}

function isInstanceContextArg(arg: ILayoutDynamicsArg): arg is ILayoutDynamicsInstanceContextArg {
  return typeof arg === 'object' && 'instanceContext' in arg;
}

function isApplicationSettingsArg(arg: ILayoutDynamicsArg): arg is ILayoutDynamicsApplicationSettingsArg {
  return typeof arg === 'object' && 'applicationSettings' in arg;
}
