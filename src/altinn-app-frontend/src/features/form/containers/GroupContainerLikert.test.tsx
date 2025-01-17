import {
  createFormDataUpdateAction,
  createFormError,
  defaultMockQuestions,
  mockOptions,
  render,
  validateRadioLayout,
  validateTableLayout,
} from 'src/features/form/containers/GroupContainerLikertTestUtils';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('GroupContainer', () => {
  describe('Desktop', () => {
    it('should render table using options and not optionsId', () => {
      render({
        radioButtonProps: {
          optionsId: 'non-existing-options-id',
          options: mockOptions,
        },
      });
      validateTableLayout(defaultMockQuestions);
    });
    it('should render table with one selected row', () => {
      const mockQuestions = defaultMockQuestions.map((mock, index) => {
        if (index === 2) {
          // Set one answer to selected
          return { ...mock, answer: '2' };
        }
        return mock;
      });
      render({ mockQuestions });
      validateTableLayout(mockQuestions);
    });
    it('should render table with two selected row', () => {
      const mockQuestions = defaultMockQuestions.map((mock, index) => {
        if (index === 2) {
          // Set one answer to selected
          return { ...mock, answer: '2' };
        }
        if (index === 4) {
          // Set one answer to selected
          return { ...mock, answer: '1' };
        }
        return mock;
      });
      render({ mockQuestions });
      validateTableLayout(mockQuestions);
    });
    it('should render table with start binding', () => {
      render({
        likertContainerProps: {
          edit: {
            mode: 'likert',
            filter: [{ key: 'start', value: '2' }],
          },
        },
      });

      validateTableLayout(defaultMockQuestions.slice(2));
    });
    it('should render table with end binding', () => {
      render({
        likertContainerProps: {
          edit: {
            mode: 'likert',
            filter: [{ key: 'stop', value: '3' }],
          },
        },
      });

      validateTableLayout(defaultMockQuestions.slice(0, 3));
    });
    it('should render table with start and end binding', () => {
      render({
        likertContainerProps: {
          edit: {
            mode: 'likert',
            filter: [
              { key: 'start', value: '2' },
              { key: 'stop', value: '4' },
            ],
          },
        },
      });

      validateTableLayout(defaultMockQuestions.slice(2, 4));
    });
    it('should render table view and click radiobuttons', async () => {
      const { mockStorDispatch } = render();
      validateTableLayout(defaultMockQuestions);

      const rad1 = screen.getByRole('radiogroup', {
        name: /Hvordan trives du på skolen/i,
      });
      const btn1 = within(rad1).getByRole('radio', {
        name: /Bra/i,
      });

      const rad2 = screen.getByRole('radiogroup', {
        name: /Har du det bra/i,
      });

      const btn2 = within(rad2).getByRole('radio', {
        name: /Dårlig/i,
      });
      mockStorDispatch.mockClear();
      expect(btn1).not.toBeChecked();
      await userEvent.click(btn1);
      expect(mockStorDispatch).toHaveBeenCalledWith(
        createFormDataUpdateAction(0, '1'),
      );
      mockStorDispatch.mockClear();
      expect(btn2).not.toBeChecked();
      await userEvent.click(btn2);

      expect(mockStorDispatch).toHaveBeenCalledWith(
        createFormDataUpdateAction(1, '3'),
      );
    });

    it('should render standard view and use keyboard to navigate', async () => {
      const { mockStorDispatch } = render();
      validateTableLayout(defaultMockQuestions);
      await userEvent.tab();
      await userEvent.keyboard('[Space]');
      expect(mockStorDispatch).toHaveBeenCalledWith(
        createFormDataUpdateAction(0, '1'),
      );
    });
    it('should support nested binding for question text in data model', async () => {
      const extraTextResources = defaultMockQuestions.map((question, i) => ({
        value: question.Question,
        id: `nested-question-binding-${i}`,
      }));
      const mockQuestions = defaultMockQuestions.map((question, i) => ({
        ...question,
        Question: `nested-question-binding-${i}`,
      }));
      render({ mockQuestions, extraTextResources });
      validateTableLayout(defaultMockQuestions);
    });
    it('should render error message', async () => {
      render({
        validations: createFormError(1),
      });
      expect(screen.getByRole('alert')).toHaveTextContent('Feltet er påkrevd');
      screen.getByText(/En av radene er ikke fylt ut riktig/i);
    });
    it('should render 2 alerts', async () => {
      render({
        validations: { ...createFormError(1), ...createFormError(2) },
      });
      expect(screen.getAllByRole('alert')).toHaveLength(2);
      screen.getByText(/En av radene er ikke fylt ut riktig/i);
    });
    it('should display title and description', async () => {
      render({
        likertContainerProps: {
          textResourceBindings: {
            title: 'Likert test title',
            description: 'This is a test description',
          },
        },
      });
      expect(
        screen.getByRole('table', { name: /Likert test title/i }),
      ).toHaveAccessibleDescription('This is a test description');
    });
  });
  describe('Mobile', () => {
    it('should display title and description', async () => {
      render({
        likertContainerProps: {
          textResourceBindings: {
            title: 'Likert test title',
            description: 'This is a test description',
          },
        },
        mobileView: true,
      });
      expect(
        screen.getByRole('group', { name: /Likert test title/i }),
      ).toHaveAccessibleDescription('This is a test description');
    });
    it('should render mobile view and click radiobuttons', async () => {
      const { mockStorDispatch } = render({ mobileView: true });
      validateRadioLayout(defaultMockQuestions);
      const rad1 = screen.getByRole('radiogroup', {
        name: /Hvordan trives du på skolen/i,
      });
      const btn1 = within(rad1).getByRole('radio', {
        name: /Bra/i,
      });

      expect(btn1).not.toBeChecked();
      await userEvent.click(btn1);
      expect(mockStorDispatch).toHaveBeenCalledWith(
        createFormDataUpdateAction(0, '1'),
      );
      mockStorDispatch.mockClear();

      const rad2 = screen.getByRole('radiogroup', {
        name: /Har du det bra/i,
      });

      const btn2 = within(rad2).getByRole('radio', {
        name: /Dårlig/i,
      });

      expect(btn2).not.toBeChecked();
      await userEvent.click(btn2);
      expect(mockStorDispatch).toHaveBeenCalledWith(
        createFormDataUpdateAction(1, '3'),
      );
    });
    it('should render mobile view with selected values', () => {
      const mockQuestions = defaultMockQuestions.map((mock, index) => {
        if (index === 2) {
          // Set one answer to selected
          return { ...mock, Answer: '2' };
        }
        return mock;
      });
      render({ mockQuestions, mobileView: true });
      validateRadioLayout(mockQuestions);

      // Validate that radio is selected
      const selectedRow = screen.getByRole('radiogroup', {
        name: mockQuestions[2].Question,
      });

      const selectedRadio = within(selectedRow).getByRole('radio', {
        name: /Ok/i,
      });
      expect(selectedRadio).toBeChecked();
    });

    it('should render error message', async () => {
      render({
        validations: { ...createFormError(1), ...createFormError(2) },
        mobileView: true,
      });
      expect(screen.getAllByRole('alert')).toHaveLength(2);
    });

    it('should render mobile layout with start and end binding', () => {
      render({
        mobileView: true,
        likertContainerProps: {
          edit: {
            mode: 'likert',
            filter: [
              { key: 'start', value: '2' },
              { key: 'stop', value: '4' },
            ],
          },
        },
      });

      validateRadioLayout(defaultMockQuestions.slice(2, 4));
    });
  });
});
