export class PrepareDataProcess {
  private itemsValidate: any[];
  private readonly dataProviders: any[];
  private duplicates: any[];
  private prepareProperties: any[];
  private itemsPrepare: any;
  constructor(data: any[]) {
    this.itemsValidate = [];
    this.dataProviders = data;
    this.duplicates = [];
    this.itemsPrepare = [];
    this.prepareProperties = [];
    this.init();
  }
  async searhDuplicate() {
    await this.prepare();
    if (this.isArray()) {
      this.duplicates = this.prepareProperties.filter((item) => {
        return this.itemsPrepare[Object.keys(item)[0]];
      });
      return this.duplicates;
    }
    return [];
  }

  async init() {
    await this.toProperties();
  }

  async toProperties() {
    if (this.isArray()) {
      this.prepareProperties = this.dataProviders.map((item) => {
        const objTemp: any = {};
        objTemp[`${Object.values(item)[0]}-${Object.values(item)[1]}`] = item;
        return objTemp;
      });
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

  private async prepare() {
    this.itemsPrepare = this.prepareProperties.reduce((acc: any, item: any) => {
      const clave = Object.keys(item)[0];
      //   console.log(`clave: ${clave}`);
      acc[clave] = ++acc[clave] || 0;
      return acc;
    }, {});
  }
  async validItems() {
    if (this.isArray()) {
      this.itemsValidate = Object.keys(this.itemsPrepare).map((item) => {
        return this.prepareProperties.find(
          (element) => Object.keys(element)[0] === item
        );
      });
      return this.itemsValidate;
    }
    return [];
  }
}
