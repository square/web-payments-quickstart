export function uuidV4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.trunc(Math.random() * 16),
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
