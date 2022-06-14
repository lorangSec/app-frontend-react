import { GridSize } from '@material-ui/core';
import { IMapping, IOption, Triggers } from '../../../types';
import { ILayoutDynamicsExpr } from "src/features/form/dynamics/layoutDynamics/types";

export interface ILayouts {
  [id: string]: IFormLayout;
}

export interface ILayoutEntry {
  id: string;
  type: GroupTypes | ComponentTypes;
  triggers?: Triggers[];
}

export interface ILayoutGroup extends ILayoutEntry {
  children: string[];
  dataModelBindings?: IDataModelBindings;
  maxCount: number;
  textResourceBindings?: ITextResourceBindings;
  tableHeaders?: string[];
  edit?: IGroupEditProperties;
  hidden2?: boolean|ILayoutDynamicsExpr;
}

export interface ILayoutComponent extends ILayoutEntry {
  dataModelBindings: IDataModelBindings;
  isValid?: boolean;
  readOnly?: boolean;
  optionsId?: string;
  options?: IOption[];
  disabled?: boolean;
  required?: boolean;
  textResourceBindings: ITextResourceBindings;
  formData?: any;
  grid?: IGrid;
  hidden2?: boolean|ILayoutDynamicsExpr;
}

export type GroupTypes = 'Group' | 'group';

export type ComponentTypes =
  | 'AddressComponent'
  | 'AttachmentList'
  | 'Button'
  | 'Checkboxes'
  | 'Datepicker'
  | 'Dropdown'
  | 'FileUpload'
  | 'FileUploadWithTag'
  | 'Header'
  | 'Input'
  | 'NavigationButtons'
  | 'InstantiationButton'
  | 'Paragraph'
  | 'Image'
  | 'RadioButtons'
  | 'Summary'
  | 'TextArea'
  | 'NavigationBar'
  | 'Likert';

export interface IDataModelBindings {
  [id: string]: string;
}

export interface ITextResourceBindings {
  [id: string]: string;
}

export interface IFormLayout {
  data: ILayoutData;
  hidden2?: ILayoutDynamicsExpr;
}

export interface ILayoutData {
  layout: ILayout;
}

export type ILayout = Array<ILayoutComponent | ILayoutGroup>;

export interface ISelectionComponentProps extends ILayoutComponent {
  options?: IOption[];
  optionsId?: string;
  mapping?: IMapping;
  secure?: boolean;
}

export interface IGrid extends IGridStyling {
  labelGrid?: IGridStyling;
  innerGrid?: IGridStyling;
}

export interface IGridStyling {
  xs?: GridSize;
  sm?: GridSize;
  md?: GridSize;
  lg?: GridSize;
  xl?: GridSize;
}

export interface IGroupEditProperties {
  mode?: 'hideTable' | 'showTable' | 'showAll' | 'likert';
  filter?: IGroupFilter[];
  addButton?: boolean;
  saveButton?: boolean;
  deleteButton?: boolean;
  multiPage?: boolean;
  openByDefault?: boolean;
}

export interface IGroupFilter {
  key: string;
  value: string;
}
