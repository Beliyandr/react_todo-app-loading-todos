/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from 'react';
import { UserWarning } from './UserWarning';
import {
  addTodo,
  deleteTodo,
  getTodos,
  USER_ID,
  updateTodo,
} from './api/todos';
import { Todo } from './types/Todo';
import classNames from 'classnames';

type filterName = 'All' | 'Active' | 'Complteted';

export const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todo, setTodo] = useState<string>('');

  const [activeFilter, setActiveFilter] = useState<filterName>('All');

  const filteredTodos = onFilteredTodos(activeFilter);

  if (!USER_ID) {
    return <UserWarning />;
  }

  useEffect(loadPosts, []);

  function loadPosts() {
    setLoading(true);
    getTodos()
      .then(todos => {
        setTodos(todos);
      })
      .catch(() => showError('Unable to load todos'))
      .finally(() => {
        setLoading(false);
      });
  }

  function onFilteredTodos(filterName: filterName): Todo[] {
    switch (filterName) {
      case 'All':
        return todos;
      case 'Active':
        return todos.filter(todo => !todo.completed);
      case 'Complteted':
        return todos.filter(todo => !!todo.completed);
      default:
        return todos;
    }
  }

  function crateNewTodo(title: string) {
    return {
      completed: false,
      id: 0,
      title: title,
      userId: USER_ID,
    };
  }

  const showError = (text: string) => {
    setErrorMsg(text);
    window.setTimeout(() => {
      setErrorMsg('');
    }, 3000);
  };

  const handleCloseErrorButton = () => {
    setErrorMsg('');
  };

  const createTodo = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!todo.trim()) {
      showError('Title should not be empty');
      return;
    }

    addTodo(crateNewTodo(todo))
      .then(newTodo => {
        setTodos(prev => {
          return [...prev, newTodo];
        });
        setTodo('');
        reset();
      })
      .catch(() => {
        showError('Unable to add a todo');
      });
  };

  const removeTodo = (id: number) => {
    deleteTodo(id)
      .then(() => {
        setTodos(prevTodos => {
          return prevTodos.filter(todo => todo.id !== id);
        });
      })
      .catch(() => showError('Unable to delete a todo'));
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    setTodo(event.target.value);
  };

  function reset() {
    setTodo('');
  }

  function updateChecked(updatedTodo: Todo) {
    updatedTodo.completed = !updatedTodo.completed;

    updateTodo(updatedTodo)
      .then(todo => {
        setTodos(currentTodos => {
          const newPosts = [...currentTodos];
          const index = newPosts.findIndex(todo => todo.id === updatedTodo.id);

          newPosts.splice(index, 1, todo);

          return newPosts;
        });
      })
      .catch(() => showError('Unable to update a todo'));
  }

  // const changeTitleTodo = (todo: Todo) => {};

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          <button
            type="button"
            className="todoapp__toggle-all active"
            data-cy="ToggleAllButton"
          />

          {/* Add a todo on form submit */}
          <form onSubmit={createTodo} onReset={reset}>
            <input
              data-cy="NewTodoField"
              type="text"
              value={todo}
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              onChange={handleChange}
            />
          </form>
        </header>

        <section className="todoapp__main" data-cy="TodoList">
          {filteredTodos?.map(todo => (
            <div
              data-cy="Todo"
              className={classNames('todo', { completed: todo.completed })}
              key={todo.id}
            >
              <label className="todo__status-label">
                <input
                  data-cy="TodoStatus"
                  type="checkbox"
                  className="todo__status"
                  onClick={() => {
                    updateChecked(todo);
                  }}
                  onDoubleClick={() => updateTodo(todo)}
                  // checked={todo.completed}
                />
              </label>

              <span data-cy="TodoTitle" className="todo__title">
                {todo.title}
              </span>

              {/* Remove button appears only on hover */}
              <button
                type="button"
                className="todo__remove"
                data-cy="TodoDelete"
                onClick={() => removeTodo(todo.id)}
              >
                ×
              </button>

              {/* overlay will cover the todo while it is being deleted or updated */}
              <div data-cy="TodoLoader" className="modal overlay">
                <div className="modal-background has-background-white-ter" />
                <div className="loader" />
              </div>
            </div>
          ))}

          {/* This is a completed todo */}
          <div data-cy="Todo" className="todo completed">
            <label className="todo__status-label">
              <input
                data-cy="TodoStatus"
                type="checkbox"
                className="todo__status"
                checked
              />
            </label>

            <span data-cy="TodoTitle" className="todo__title">
              Completed Todo
            </span>

            {/* Remove button appears only on hover */}
            <button type="button" className="todo__remove" data-cy="TodoDelete">
              ×
            </button>

            {/* overlay will cover the todo while it is being deleted or updated */}
            <div data-cy="TodoLoader" className="modal overlay">
              <div className="modal-background has-background-white-ter" />
              <div className="loader" />
            </div>
          </div>

          {/* This todo is an active todo */}
          <div data-cy="Todo" className="todo">
            <label className="todo__status-label">
              <input
                data-cy="TodoStatus"
                type="checkbox"
                className="todo__status"
              />
            </label>

            <span data-cy="TodoTitle" className="todo__title">
              Not Completed Todo
            </span>
            <button type="button" className="todo__remove" data-cy="TodoDelete">
              ×
            </button>

            <div data-cy="TodoLoader" className="modal overlay">
              <div className="modal-background has-background-white-ter" />
              <div className="loader" />
            </div>
          </div>

          {/* This todo is being edited */}
          <div data-cy="Todo" className="todo">
            <label className="todo__status-label">
              <input
                data-cy="TodoStatus"
                type="checkbox"
                className="todo__status"
              />
            </label>

            {/* This form is shown instead of the title and remove button */}
            <form>
              <input
                data-cy="TodoTitleField"
                type="text"
                className="todo__title-field"
                placeholder="Empty todo will be deleted"
                value="Todo is being edited now"
              />
            </form>

            <div data-cy="TodoLoader" className="modal overlay">
              <div className="modal-background has-background-white-ter" />
              <div className="loader" />
            </div>
          </div>

          {/* This todo is in loadind state */}
          <div data-cy="Todo" className="todo">
            <label className="todo__status-label">
              <input
                data-cy="TodoStatus"
                type="checkbox"
                className="todo__status"
              />
            </label>

            <span data-cy="TodoTitle" className="todo__title">
              Todo is being saved now
            </span>

            <button type="button" className="todo__remove" data-cy="TodoDelete">
              ×
            </button>

            {/* 'is-active' class puts this modal on top of the todo */}
            <div data-cy="TodoLoader" className="modal overlay is-active">
              <div className="modal-background has-background-white-ter" />
              <div className="loader" />
            </div>
          </div>
        </section>

        {/* Hide the footer if there are no todos */}

        {filteredTodos?.length && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {filteredTodos.length} items left
            </span>

            {/* Active link should have the 'selected' class */}
            <nav className="filter" data-cy="Filter">
              <a
                href="#/"
                className={classNames('filter__link', {
                  selected: activeFilter === 'All',
                })}
                data-cy="FilterLinkAll"
                onClick={() => setActiveFilter('All')}
              >
                All
              </a>

              <a
                href="#/active"
                className={classNames('filter__link', {
                  selected: activeFilter === 'Active',
                })}
                data-cy="FilterLinkActive"
                onClick={() => setActiveFilter('Active')}
              >
                Active
              </a>

              <a
                href="#/completed"
                className={classNames('filter__link', {
                  selected: activeFilter === 'Complteted',
                })}
                data-cy="FilterLinkCompleted"
                onClick={() => setActiveFilter('Complteted')}
              >
                Completed
              </a>
            </nav>

            {/* this button should be disabled if there are no completed todos */}
            <button
              type="button"
              className="todoapp__clear-completed"
              data-cy="ClearCompletedButton"
            >
              Clear completed
            </button>
          </footer>
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <div
        data-cy="ErrorNotification"
        className={classNames(
          'notification is-danger is-light has-text-weight-normal',
          { hidden: !errorMsg },
        )}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={handleCloseErrorButton}
        />
        {errorMsg}
        {/* show only one message at a time */}
        {/* Unable to load todos
        <br />
        Title should not be empty
        <br />
        Unable to add a todo
        <br />
        Unable to delete a todo
        <br />
        Unable to update a todo */}
      </div>
    </div>
  );
};
