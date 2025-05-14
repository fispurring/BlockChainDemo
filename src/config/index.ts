function get(key: string, defaultValue = null) {
  const value = process.env[key];
  if (value === undefined) {
    return defaultValue;
  }
  return value;
}
export default { get };
