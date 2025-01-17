import * as React from 'react';
import {
  ILayoutComponent,
  ILayoutGroup,
  ISelectionComponentProps,
} from 'src/features/form/layout';
import SummaryGroupComponent from './SummaryGroupComponent';
import SingleInputSummary from './SingleInputSummary';
import { AttachmentSummaryComponent } from './AttachmentSummaryComponent';
import { AttachmentWithTagSummaryComponent } from './AttachmentWithTagSummaryComponent';
import MultipleChoiceSummary from './MultipleChoiceSummary';
import SummaryBoilerplate from 'src/components/summary/SummaryBoilerplate';

export interface ISummaryComponentSwitch {
  change: {
    onChangeClick: () => void;
    changeText: string;
  };
  formComponent: ILayoutComponent | ILayoutGroup;
  hasValidationMessages?: boolean;
  label?: any;
  formData?: any;
  componentRef?: string;
  groupProps?: {
    parentGroup?: string;
    pageRef?: string;
    largeGroup?: boolean;
    index?: number;
  };
}

export default function SummaryComponentSwitch({
  change,
  formComponent,
  label,
  componentRef,
  hasValidationMessages,
  formData,
  groupProps = {}
}: ISummaryComponentSwitch) {
  if (!formComponent) {
    return null;
  }
  switch (formComponent.type) {
    case 'Group':
    case 'group': {
      return <SummaryGroupComponent {...change} {...groupProps} componentRef={componentRef} />;
    }
    case 'FileUpload': {
      return (
        <>
          <SummaryBoilerplate
            {...change}
            label={label}
            hasValidationMessages={hasValidationMessages}
          />
          <AttachmentSummaryComponent componentRef={componentRef} />
        </>
      );
    }
    case 'FileUploadWithTag': {
      return (
        <>
          <SummaryBoilerplate
            {...change}
            label={label}
            hasValidationMessages={hasValidationMessages}
          />
          <AttachmentWithTagSummaryComponent
            componentRef={componentRef}
            component={formComponent as ISelectionComponentProps}
          />
        </>
      );
    }
    case 'Checkboxes': {
      return (
        <MultipleChoiceSummary
          {...change}
          label={label}
          hasValidationMessages={hasValidationMessages}
          formData={formData}
          readOnlyComponent={(formComponent as ILayoutComponent).readOnly}
        />
      );
    }
    default:
      return (
        <SingleInputSummary
          {...change}
          label={label}
          hasValidationMessages={hasValidationMessages}
          formData={formData}
          readOnlyComponent={(formComponent as ILayoutComponent).readOnly}
        />
      );
  }
}
