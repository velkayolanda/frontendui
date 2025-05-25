import { CreateDelayer } from "@hrbolek/uoisfrontend-shared";
import { useState } from "react";

/**
 * A custom React hook for managing and updating local model state with delayed (debounced) submission.
 *
 * This hook is useful when editing a data model (e.g., a form) where updates should be submitted asynchronously
 * but not immediately on every keystroke. Changes are delayed using a debouncer (`CreateDelayer`) and submitted
 * via the provided `onSubmit` callback.
 *
 * @function useDelayedModelUpdate
 * @param {Object} initialData - The initial data object representing the model.
 * @param {Function} onSubmit - A function called with the updated model to perform async updates (e.g., API call).
 *                              Must return a Promise that resolves to the updated model.
 *
 * @returns {Object} Hook return values.
 * @returns {Object} return.state - The current state of the local model.
 * @returns {Function} return.setState - A setter function to manually override the model state.
 * @returns {Function} return.handleChange - A change handler to attach to form inputs (expects `e.target.id` and `e.target.value`).
 *
 * @example
 * const { state, handleChange } = useDelayedModelUpdate(user, (newData) => updateUserAsync(newData));
 *
 * return (
 *   <input id="name" value={state.name} onChange={handleChange} />
 * );
 */
export const useDelayedModelUpdate = (initialData, onSubmit) => {
  const [state, setState] = useState(initialData);
  const [delayer] = useState(() => CreateDelayer());

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (state[id] === value) return;

    const newState = { ...state, [id]: value };
    if (typeof initialData[id] === "number") {
      newState[id] = Number(value);
    }

    delayer(async () => {
      const updated = await onSubmit(newState);
      setState(updated);
    });
  };

  return { state, setState, handleChange };
};


/**
 * A custom React state hook with debounced async updates and form input integration.
 *
 * Behaves similarly to `useState`, but updates are debounced and sent via a provided async `onSubmit` function.
 * Also includes a `handleChange` function suitable for form inputs with `id` and `value`.
 *
 * @function useRemoteState
 * @param {Object} initialValue - The initial model value.
 * @param {Function} onSubmit - Async function that receives updated state and returns the confirmed value.
 *
 * @returns {[Object, Function, Function]} Tuple of:
 *   - `state`: current local state,
 *   - `setRemoteState`: function to trigger update,
 *   - `handleChange`: input handler (e.g., for `<input onChange={handleChange}>`)
 *
 * @example
 * const [user, setUser, handleUserChange] = useRemoteState(userData, updateUserAsync);
 *
 * return (
 *   <input id="name" value={user.name} onChange={handleUserChange} />
 * );
 */
export const useRemoteState = (initialValue, onSubmit) => {
  const [state, setState] = useState(initialValue);
  const [delayer] = useState(() => CreateDelayer());

  const setRemoteState = (next) => {
    const newState = typeof next === 'function' ? next(state) : next;

    delayer(async () => {
      const updated = await onSubmit(newState);
      setState(updated);
    });
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (state[id] === value) return;

    const newState = { ...state, [id]: value };
    setRemoteState(newState)
  };

  return [state, setRemoteState, handleChange];
};
