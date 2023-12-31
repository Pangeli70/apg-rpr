export class ApgUts {
  static Round(anum, aprecision) {
    const t = 10 ** (-1 * aprecision);
    const v = anum * t;
    const r = Math.round(v) / t;
    return r;
  }
  /**
   * If the condition is false alerts and throws an error
   * @param acondition condition that has to be true
   * @param aerrorMessage message to display
   */
  static Assert(acondition, aerrorMessage) {
    if (!acondition) {
      alert(aerrorMessage);
      throw new Error(aerrorMessage);
    }
  }
  /**
   * If the condition is true alerts and throws an error
   * @param acondition condition that has to be false
   * @param aerrorMessage message to display
   */
  static AssertNot(acondition, aerrorMessage) {
    this.Assert(!acondition, aerrorMessage);
  }
  static GetPropertyName(obj, selector) {
    const keyRecord = Object.keys(obj).reduce((res, key) => {
      const typedKey = key;
      res[typedKey] = typedKey;
      return res;
    }, {});
    return selector(keyRecord);
  }
}
