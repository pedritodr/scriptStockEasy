export class PrepareDataProcess {
  private itemsValidate: any[];
  private readonly dataProviders: any[];
  private duplicates: any[];
  private itemsPrepare: any;
  constructor(data: any[]) {
    this.itemsValidate = [];
    this.dataProviders = data;
    this.duplicates = [];
    this.itemsPrepare = [];
    this.prepare();
  }
  async searhDuplicate() {
    if (this.isArray()) {
      this.duplicates = this.dataProviders.filter((item) => {
        return this.itemsPrepare[JSON.stringify(item)];
      });
      //  console.log(this.duplicates);
      return this.duplicates;
    }
    return [];
  }

  private isArray() {
    if (!Array.isArray(this.dataProviders)) {
      throw "The argument must be an array.";
    }

    if (!this.dataProviders.length) {
      return false;
    }
    return true;
  }

  private prepare() {
    this.itemsPrepare = this.dataProviders.reduce((acc: any, item: any) => {
      const clave = JSON.stringify(item);
      acc[clave] = ++acc[clave] || 0;
      return acc;
    }, {});
    console.log(this.itemsPrepare);
  }
  async validItems() {
    if (this.isArray()) {
      this.itemsValidate = Object.keys(this.itemsPrepare).map((item) => {
        return JSON.parse(item);
      });
      return this.itemsValidate;
    }
    return [];
  }
}
