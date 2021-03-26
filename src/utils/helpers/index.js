const has = Object.prototype.hasOwnProperty;

export const isDiff = (A, B) => JSON.stringify(A) !== JSON.stringify(B);

export const isEmpty = (prop) => {
  return (
    prop === null ||
    prop === undefined ||
    (has.call(prop, 'length') && prop.length === 0) ||
    (prop.constructor === Object && Object.keys(prop).length === 0)
  );
};
