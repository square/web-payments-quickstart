/*
 * A Generic function for binding an event to a promise
 *
 * Since your framework likely already provides both an eventing system
 * and way to bind actions to user input, you likely won't need this in your implementation.
 */
export default function deferredEvent(triggerElement, event, callback) {
  return new Promise((resolve, reject) => {
    // Promises can only resolve or reject once, so we only bind the event once
    // This allows us to safely rebind a new promise without creating multiple event listeners
    triggerElement.addEventListener(
      event,
      (e) => {
        e.stopPropagation();
        e.preventDefault();
        callback(resolve, reject, e);
      },
      { once: true }
    );
  });
}
