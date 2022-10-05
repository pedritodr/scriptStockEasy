import { PrepareDataProcess } from "./searchRepeat";

export const searchSKU = async (data: any) => {
  console.log(data.length);
  const prepareDataProcess = new PrepareDataProcess(data);

  const validItems = await prepareDataProcess.validItems();
  let skus = "";
  for (const item of validItems) {
    skus += `'${item.reference_id}', `;
  }

  return {
    skus,
  };
};
