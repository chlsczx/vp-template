import { logJSON } from "./logUtils";

const getStartId = (id: string) => {
  return `[${id}] - start`;
};

const getEndId = (id: string) => {
  return `[${id}] - end`;
};

const markStart = (id: string) => {
  performance.mark(getStartId(id));
};

const markEnd = (id: string) => {
  performance.mark(getEndId(id));
};

const measurePerformance = (id: string) => {
  performance.measure(`[${id}]`, getStartId(id), getEndId(id));
};

export const bench = <R>(id: string, func: () => R): R => {
  markStart(id);
  const result = func();
  markEnd(id);

  measurePerformance(id);
  // logJSON(performance.getEntriesByName(`[${id}]`).pop());
  return result;
};
