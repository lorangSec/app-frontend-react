import { ILayouts, ILayoutComponent, ILayoutGroup } from "src/features/form/layout";
import { IFormData } from "src/features/form/data/formDataReducer";
import { IRepeatingGroups } from "src/types";

export function runLayoutDynamics(
  key: keyof ILayoutComponent | keyof ILayoutGroup,
  layouts:ILayouts,
  formData:IFormData,
  repeatingGroups:IRepeatingGroups,
):string[] {
  // TODO: Iterate form layout
}
