import { createStore } from "jotai";

// Shared Jotai store — used by <JotaiProvider> inside React and by the
// platform-api fetcher outside React. Creating it here (rather than relying
// on Jotai's default store) means both sides reference the same atom values.
export const jotaiStore = createStore();
