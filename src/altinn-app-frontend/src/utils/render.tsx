import * as React from 'react';
import { IValidationItem } from 'src/types';
import { MessageComponent } from '../components/message/MessageComponent';

const messageComponentStyle = {
  display: 'block',
  width: 'fit-content',
};

export function renderValidationMessagesForComponent(
  validationMessages: any,
  id: string,
): JSX.Element[] {
  if (!validationMessages) {
    return null;
  }
  const validationMessageElements: JSX.Element[] = [];
  if (validationMessages.errors && validationMessages.errors.length > 0) {
    validationMessageElements.push(
      renderValidationMessages(
        validationMessages.errors,
        `error_${id}`,
        'error',
      ),
    );
  }

  if (validationMessages.warnings && validationMessages.warnings.length > 0) {
    validationMessageElements.push(
      renderValidationMessages(
        validationMessages.warnings,
        `message_${id}`,
        'message',
      ),
    );
  }
  return validationMessageElements.length > 0
    ? validationMessageElements
    : null;
}

export function renderValidationMessages(
  messages: IValidationItem[],
  id: string,
  messageType: any,
) {
  return (
    <MessageComponent
      messageType={messageType}
      style={messageComponentStyle}
      key={messageType}
      id={id}
    >
      <ol>
        {messages.map((validationItem: IValidationItem, idx: number) => {
          if (typeof validationItem.message === 'string') {
            return (
              <li key={`validationMessage-${id}-${validationItem.code}`}>
                <p role='alert'>{validationItem.message}</p>
              </li>
            );
          }
          return <li role='alert' key={`validationMessage-${id}-${idx}`}>{validationItem.message}</li>;
        })}
      </ol>
    </MessageComponent>
  );
}
