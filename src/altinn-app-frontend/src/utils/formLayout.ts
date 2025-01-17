import { ITextResource } from 'altinn-shared/types';
import { IInstantiationButtonProps } from 'src/components/base/InstantiationButtonComponent';
import { IAttachmentState } from 'src/shared/resources/attachments/attachmentReducer';
import {
  IRepeatingGroups,
  ILayoutNavigation,
  ITextResourceBindings,
  IFileUploadersWithTag,
  IOptionsChosen,
  IFormFileUploaderWithTagComponent,
  IMapping,
} from 'src/types';
import {
  IGroupEditProperties,
  ILayout,
  ILayoutComponent,
  ILayoutGroup,
} from '../features/form/layout';

export function getRepeatingGroups(formLayout: ILayout, formData: any) {
  const repeatingGroups: IRepeatingGroups = {};
  const regex = new RegExp(/\[([0-9]+)\]/);

  const groups = formLayout.filter(
    (layoutElement) => layoutElement.type.toLowerCase() === 'group',
  );

  const childGroups: string[] = [];
  groups.forEach((group: ILayoutGroup) => {
    group.children?.forEach((childId: string) => {
      formLayout
        .filter((element) => {
          if (element.type.toLowerCase() !== 'group') return false;
          if (group.edit?.multiPage) {
            return childId.split(':')[1] === element.id;
          }
          return element.id === childId;
        })
        .forEach((childGroup) => childGroups.push(childGroup.id));
    });
  });

  // filter away groups that should be rendered as child groups
  const filteredGroups = formLayout.filter(
    (group) => childGroups.indexOf(group.id) === -1,
  );

  filteredGroups.forEach((groupElement: ILayoutGroup) => {
    if (groupElement.maxCount > 1) {
      const groupFormData = Object.keys(formData).filter((key) => {
        return key.startsWith(groupElement.dataModelBindings.group);
      });
      if (groupFormData && groupFormData.length > 0) {
        const lastItem = groupFormData[groupFormData.length - 1];
        const match = lastItem.match(regex);
        if (match && match[1]) {
          const index = parseInt(match[1], 10);
          repeatingGroups[groupElement.id] = {
            index,
            dataModelBinding: groupElement.dataModelBindings?.group,
            editIndex: -1,
          };
          const groupElementChildGroups = [];
          groupElement.children?.forEach((id) => {
            if (
              groupElement.edit?.multiPage &&
              childGroups.includes(id.split(':')[1])
            ) {
              groupElementChildGroups.push(id.split(':')[1]);
            } else if (childGroups.includes(id)) {
              groupElementChildGroups.push(id);
            }
          });
          groupElementChildGroups.forEach((childGroupId: string) => {
            const childGroup = groups.find(
              (element) => element.id === childGroupId,
            );
            [...Array(index + 1)].forEach(
              (_x: any, childGroupIndex: number) => {
                const groupId = `${childGroup.id}-${childGroupIndex}`;
                repeatingGroups[groupId] = {
                  index: getIndexForRepeatingGroup(
                    formData,
                    childGroup.dataModelBindings?.group,
                    groupElement.dataModelBindings.group,
                    childGroupIndex,
                  ),
                  baseGroupId: childGroup.id,
                  editIndex: -1,
                };
              },
            );
          });
        }
      } else {
        repeatingGroups[groupElement.id] = {
          index: -1,
          dataModelBinding: groupElement.dataModelBindings?.group,
          editIndex: -1,
        };
      }
    }
  });
  return repeatingGroups;
}

export function getFileUploadersWithTag(
  formLayout: ILayout,
  attachmentState: IAttachmentState,
) {
  const fileUploaders: IFileUploadersWithTag = {};
  const uploaders = formLayout.filter(
    (layoutElement) => layoutElement.type.toLowerCase() === 'fileuploadwithtag',
  );
  uploaders.forEach((component: ILayoutComponent) => {
    const uploader = component as unknown as IFormFileUploaderWithTagComponent;
    const attachments = attachmentState.attachments[uploader.id];
    if (attachments !== undefined) {
      const chosenOptions: IOptionsChosen = {};
      for (let index = 0; index < attachments.length; index++) {
        chosenOptions[attachments[index].id] = attachments[index].tags[0];
      }
      fileUploaders[uploader.id] = {
        editIndex: -1,
        chosenOptions,
      };
    } else {
      fileUploaders[uploader.id] = {
        editIndex: -1,
        chosenOptions: {} as IOptionsChosen,
      };
    }
  });
  return fileUploaders;
}

function getIndexForRepeatingGroup(
  formData: any,
  groupBinding: string,
  parentGroupBinding: string,
  parentIndex: number,
): number {
  const regex = new RegExp(/\[([0-9]+)](?!.*\[([0-9]+)])/);
  const indexedGroupBinding = groupBinding.replace(
    parentGroupBinding,
    `${parentGroupBinding}[${parentIndex}]`,
  );
  const groupFormData = Object.keys(formData).filter((key) => {
    return key.startsWith(indexedGroupBinding);
  });
  if (groupFormData && groupFormData.length > 0) {
    const lastItem = groupFormData[groupFormData.length - 1];
    const match = lastItem.match(regex);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
  }
  return -1;
}

export function getNextView(
  navOptions: ILayoutNavigation,
  layoutOrder: string[],
  currentView: string,
  goBack?: boolean,
) {
  let result;
  if (navOptions) {
    if (goBack && navOptions.previous) {
      return navOptions.previous;
    }

    if (!goBack && navOptions.next) {
      return navOptions.next;
    }
  }

  if (layoutOrder) {
    const currentViewIndex = layoutOrder.indexOf(currentView);
    const newViewIndex = goBack ? currentViewIndex - 1 : currentViewIndex + 1;
    result = layoutOrder[newViewIndex];
  }

  return result;
}

export function removeRepeatingGroupFromUIConfig(
  repeatingGroups: IRepeatingGroups,
  repeatingGroupId: string,
  index: number,
  shiftData?: boolean,
): IRepeatingGroups {
  const newRepGroups = { ...repeatingGroups };
  delete newRepGroups[`${repeatingGroupId}-${index}`];
  if (shiftData) {
    const groupKeys = Object.keys(repeatingGroups).filter((key: string) =>
      key.startsWith(repeatingGroupId),
    );

    groupKeys.forEach((shiftFrom: string, keyIndex: number) => {
      if (keyIndex > index) {
        const shiftTo = groupKeys[keyIndex - 1];
        newRepGroups[shiftTo] = repeatingGroups[shiftFrom];
        delete newRepGroups[shiftFrom];
      }
    });
  }
  return newRepGroups;
}

export const getRepeatingGroupStartStopIndex = (
  repeatingGroupIndex: number,
  edit: IGroupEditProperties | undefined,
) => {
  const start = edit?.filter?.find(({ key }) => key === 'start')?.value;
  const stop = edit?.filter?.find(({ key }) => key === 'stop')?.value;
  const startIndex = start ? parseInt(start) : 0;
  const stopIndex = stop ? parseInt(stop) - 1 : repeatingGroupIndex;
  return { startIndex, stopIndex };
};

export function createRepeatingGroupComponents(
  container: ILayoutGroup,
  renderComponents: (ILayoutComponent | ILayoutGroup)[],
  repeatingGroupIndex: number,
  textResources: ITextResource[],
  hiddenFields?: string[],
): Array<Array<ILayoutComponent | ILayoutGroup>> {
  const componentArray: Array<Array<ILayoutComponent | ILayoutGroup>> = [];
  const { startIndex, stopIndex } = getRepeatingGroupStartStopIndex(
    repeatingGroupIndex,
    container.edit,
  );
  for (let i = startIndex; i <= stopIndex; i++) {
    const childComponents = renderComponents.map(
      (component: ILayoutComponent | ILayoutGroup) => {
        const componentDeepCopy: ILayoutComponent | ILayoutGroup = JSON.parse(
          JSON.stringify(component),
        );
        const dataModelBindings = { ...componentDeepCopy.dataModelBindings };
        const groupDataModelBinding = container.dataModelBindings.group;
        Object.keys(dataModelBindings).forEach((key) => {
          // eslint-disable-next-line no-param-reassign
          dataModelBindings[key] = dataModelBindings[key].replace(
            groupDataModelBinding,
            `${groupDataModelBinding}[${i}]`,
          );
        });
        const deepCopyId = `${componentDeepCopy.id}-${i}`;
        setVariableTextKeysForRepeatingGroupComponent(
          textResources,
          componentDeepCopy.textResourceBindings,
          i,
        );
        const hidden = !!hiddenFields?.find(
          (field) => field === `${deepCopyId}[${i}]`,
        );
        let mapping;
        if (componentDeepCopy.type === 'InstantiationButton') {
          mapping = setMappingForRepeatingGroupComponent(
            (componentDeepCopy as IInstantiationButtonProps).mapping,
            i,
          );
        }
        return {
          ...componentDeepCopy,
          textResourceBindings: componentDeepCopy.textResourceBindings,
          dataModelBindings,
          id: deepCopyId,
          baseComponentId: componentDeepCopy.id,
          hidden,
          mapping,
        };
      },
    );
    componentArray.push(childComponents);
  }
  return componentArray;
}

export function setMappingForRepeatingGroupComponent(
  mapping: IMapping,
  index: number,
) {
  if (mapping) {
    const indexedMapping: IMapping = {
      ...mapping,
    };
    const mappingsWithRepeatingGroupSources = Object.keys(mapping).filter(
      (source) => source.includes('[{0}]'),
    );
    mappingsWithRepeatingGroupSources.forEach((sourceMapping) => {
      delete indexedMapping[sourceMapping];
      const newSource = sourceMapping.replace('[{0}]', `[${index}]`);
      indexedMapping[newSource] = mapping[sourceMapping];
      delete indexedMapping[sourceMapping];
    });
    return indexedMapping;
  } else {
    return undefined;
  }
}

export function setVariableTextKeysForRepeatingGroupComponent(
  textResources: ITextResource[],
  textResourceBindings: ITextResourceBindings,
  index: number,
) {
  if (textResources && textResourceBindings) {
    const bindingsWithVariablesForRepeatingGroups = Object.keys(
      textResourceBindings,
    ).filter((key) => {
      const textKey = textResourceBindings[key];
      const textResource = textResources.find((text) => text.id === textKey);
      return (
        textResource &&
        textResource.variables &&
        textResource.variables.find((v) => v.key.indexOf('[{0}]') > -1)
      );
    });

    bindingsWithVariablesForRepeatingGroups.forEach((key) => {
      textResourceBindings[key] = `${textResourceBindings[key]}-${index}`;
    });
  }
}

export function hasRequiredFields(layout: ILayout) {
  return layout.find((c: ILayoutComponent) => c.required);
}
