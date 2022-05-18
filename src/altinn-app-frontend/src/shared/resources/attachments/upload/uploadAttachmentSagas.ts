import { SagaIterator } from 'redux-saga';
import { call, put, select, takeEvery } from 'redux-saga/effects';
import { AxiosRequestConfig } from 'axios';
import { customEncodeURI } from 'altinn-shared/utils';
import { updateComponentValidations } from 'src/features/form/validation/validationSlice';
import { IAttachment } from '..';
import { getFileUploadComponentValidations } from '../../../../utils/formComponentUtils';
import { IRuntimeState } from '../../../../types';
import { post } from '../../../../utils/networking';
import { fileUploadUrl } from '../../../../utils/appUrlHelper';
import AttachmentDispatcher from '../attachmentActions';
import * as AttachmentActionsTypes from '../attachmentActionTypes';
import * as uploadActions from './uploadAttachmentActions';
import FormDataActions from "src/features/form/data/formDataActions";

export function* uploadAttachmentSaga(
  {
    file,
    attachmentType,
    tmpAttachmentId,
    componentId,
    dataModelBindings,
    index,
  }: uploadActions.IUploadAttachmentAction,
): SagaIterator {
  const state: IRuntimeState = yield select();
  const currentView = state.formLayout.uiConfig.currentView;
  const language = state.language.language;

  try {
    // Sets validations to empty.
    const newValidations = getFileUploadComponentValidations(null, null);
    yield put(updateComponentValidations({
      componentId,
      layoutId: currentView,
      validations: newValidations,
    }));

    const fileUploadLink = fileUploadUrl(attachmentType);
    let contentType;

    if (!file.type) {
      contentType = `application/octet-stream`;
    } else if (file.name.toLowerCase().endsWith('.csv')) {
      contentType = 'text/csv';
    } else {
      contentType = file.type;
    }

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename=${customEncodeURI(file.name)}`,
      },
    };

    const response: any = yield call(post, fileUploadLink, config, file);

    if (response.status === 201) {
      const attachment: IAttachment = {
        name: file.name,
        size: file.size,
        uploaded: true,
        tags: [],
        id: response.data.id,
        deleting: false,
        updating: false,
      };
      yield call(AttachmentDispatcher.uploadAttachmentFulfilled,
        attachment, attachmentType, tmpAttachmentId, componentId);

      if (dataModelBindings && dataModelBindings.simpleBinding) {
        yield put(FormDataActions.updateFormData({
          componentId: componentId,
          data: response.data.id,
          field: `${dataModelBindings.simpleBinding}[${index}]`,
        }));
      }
    } else {
      const validations = getFileUploadComponentValidations('upload', language);
      yield put(updateComponentValidations({
        componentId,
        layoutId: currentView,
        validations,
      }));
      yield call(AttachmentDispatcher.uploadAttachmentRejected,
        tmpAttachmentId, attachmentType, componentId);
    }
  } catch (err) {
    const validations = getFileUploadComponentValidations('upload', language);
    yield put(updateComponentValidations({
      componentId,
      layoutId: currentView,
      validations,
    }));
    yield call(AttachmentDispatcher.uploadAttachmentRejected,
      tmpAttachmentId, attachmentType, componentId);
  }
}

export function* watchUploadAttachmentSaga(): SagaIterator {
  yield takeEvery(AttachmentActionsTypes.UPLOAD_ATTACHMENT, uploadAttachmentSaga);
}
