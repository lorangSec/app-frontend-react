import { IValidations } from '../src/types';
import { getParsedTextResourceByKey } from '../src/utils/textResource';

export function getMockValidationState(withFixed = false): IValidations {
  const fixed = withFixed ? [] : undefined;
  return {
    FormLayout: {
      componentId_1: {
        simpleBinding: {
          errors: [
            {
              code: 'error',
              message: getParsedTextResourceByKey('Error message 1', []),
            },
            {
              code: 'error',
              message: getParsedTextResourceByKey('Error message 2', []),
            },
          ],
          warnings: [],
          fixed,
        },
      },
      componentId_2: {
        customBinding: {
          errors: [],
          warnings: [
            {
              code: 'warning',
              message: getParsedTextResourceByKey('Warning message 1', []),
            },
            {
              code: 'warning',
              message: getParsedTextResourceByKey('Warning message 2', []),
            },
          ],
          fixed,
        },
      },
      'componentId_4-1': {
        simpleBinding: {
          errors: [
            {
              code: 'testError',
              message: getParsedTextResourceByKey('test error', []),
            }
          ],
          warnings: [],
          fixed,
        },
      },
      'componentId_5-0-1': {
        simpleBinding: {
          errors: [
            {
              code: 'testError',
              message: getParsedTextResourceByKey('test error', []),
            }
          ],
          warnings: [],
          fixed,
        },
      },
    },
    unmapped: {
      unmapped: {
        random_key: {
          errors: [
            {
              code: 'testError',
              message: getParsedTextResourceByKey('test error', []),
            },
          ],
          warnings: [
            {
              code: 'testWarning',
              message: getParsedTextResourceByKey('test warning', []),
            },
          ],
          fixed,
        },
      },
    },
  };
}
