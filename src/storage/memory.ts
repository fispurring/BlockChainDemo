const cache = new Map<string, any>();

function has(key: string) {
  return cache.has(key);
}

function remove(key: string) {
  cache.delete(key);
}

function get(key: string, defaultValue: any = null) {
  return cache.get(key) ?? defaultValue;
}

function set(key: string, value: any) {
  cache.set(key, value);
}

export default {
  has,
  get,
  set,
  remove,
};
