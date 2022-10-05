export const dataMock = {
  toVtex: {
    endpoint:
      "https://easyclqae93830000.vtexcommercestable.myvtex.com/api/logistics/pvt/inventory/skus/1178010/warehouses/9383-10",
    data: { unlimitedQuantity: false, quantity: 3000 },
    data_easy: {
      accountName: "easyclqae93830000.vtexcommercestable",
      warehouseId: "9383-10",
      stock: 3000,
      sku: "1178010",
      stockId: "11780100000938300000",
      updateResult: 1,
      primaryAccount: 1,
    },
    headers: {
      dynamic: [
        { "x-vtex-api-appkey": "appkey" },
        { "x-vtex-api-apptoken": "apptoken" },
      ],
      static: [{ "Content-Type": "application/json" }],
    },
    method: "PUT",
    params: {
      flag: "easy",
      ecommerce_clients: { id: "vtex", level: "operation" },
    },
  },
  id: "11780100000938300000",
  store_id: "50159080",
};
