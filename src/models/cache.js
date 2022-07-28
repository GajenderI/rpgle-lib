const Declaration = require(`./declaration`);

const inds = [...Array(98).keys(), `LR`, `KL`].map(val => `IN${val.toString().padStart(2, `0`)}`).map(ind => {
  const indDef = new Declaration(`variable`);
  indDef.name = ind;
  indDef.keywords = [`IND`];
  return indDef;
});

module.exports = class Cache {
  /**
   * 
   * @param {{subroutines?: Declaration[], procedures?: Declaration[], variables?: Declaration[], structs?: Declaration[], constants?: Declaration[], indicators?: Declaration[]}} cache 
   */
  constructor(cache = {}) {
    /** @type {Declaration[]} */
    this.subroutines = cache.subroutines || [];

    /** @type {Declaration[]} */
    this.procedures = cache.procedures || [];

    /** @type {Declaration[]} */
    this.variables = cache.variables || [];

    /** @type {Declaration[]} */
    this.structs = cache.structs || [];
    
    /** @type {Declaration[]} */
    this.constants = cache.constants || [];
    
    /** @type {Declaration[]} */
    this.indicators = cache.indicators || [...inds];
  }

  /**
   * @param {Cache} [second] 
   * @returns {Cache} merged caches
   */
  merge(second) {
    if (second) {
      return new Cache({
        subroutines: [...this.subroutines, ...second.subroutines],
        procedures: [...this.procedures, ...second.procedures],
        variables: [...this.variables, ...second.variables],
        structs: [...this.structs, ...second.structs],
        constants: [...this.constants, ...second.constants],
        indicators: [...this.indicators, ...second.indicators]
      });
    } else {
      return this;
    }
  }

  /**
   * @returns {String[]}
   */
  getNames() {
    return [
      ...this.constants.map(def => def.name), 
      ...this.procedures.map(def => def.name), 
      ...this.subroutines.map(def => def.name), 
      ...this.variables.map(def => def.name),
      ...this.structs.map(def => def.name),
    ]
  }

  /**
   * 
   * @param {string} name 
   * @returns {Declaration}
   */
  find(name) {
    name = name.toUpperCase();
    const possibles = [
      ...this.constants.filter(def => def.name.toUpperCase() === name), 
      ...this.procedures.filter(def => def.name.toUpperCase() === name), 
      ...this.subroutines.filter(def => def.name.toUpperCase() === name), 
      ...this.variables.filter(def => def.name.toUpperCase() === name),
      ...this.structs.filter(def => def.name.toUpperCase() === name),
      ...this.indicators.filter(def => def.name.toUpperCase() === name),
    ];

    if (this.structs.length > 0) {
      this.structs.filter(def => !def.keywords.includes(`QUALIFIED`)).forEach(def => {
        possibles.push(...def.subItems.filter(sub => sub.name.toUpperCase() === name));
      });
    }

    if (possibles.length > 0) {
      return possibles[0];
    } else {
      return null;
    }
  }
}