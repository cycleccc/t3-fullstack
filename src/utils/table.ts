import XLSX from "xlsx-js-style";
import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "@/server/api/root";
import { type TtextContent } from "@/app/text-content/_components/ContentTable";
 
/**
 * 将数据数组转换为 ProTable 枚举值格式
 * @param data 数据数组
 * @param key 数据项中作为枚举 key 的字段名
 * @param labelKey 数据项中作为枚举显示文本的字段名（可选，默认为 key）
 * @returns ProTable 枚举值格式的对象
 */
export function createProTableEnum<T>(
  data: T[],
  key: keyof T,
  labelKey?: keyof T,
): Record<string, { text: string }> {
  return data.reduce((acc: Record<string, { text: string }>, item) => {
    const enumKey = item[key] as unknown as string;
    const enumText = labelKey ? (item[labelKey] as unknown as string) : enumKey;
    acc[enumKey] = { text: enumText };
    return acc;
  }, {});
}


// 通用的表头样式配置
const headerStyle = {
  font: { bold: true, color: { rgb: "FFFFFF" } },
  alignment: { horizontal: "center", vertical: "center" },
};

// 设置表头样式
interface IWorksheet extends XLSX.WorkSheet {
    "!cols"?: Array<{ wch: number }>;
}

interface IHeaderStyle {
    font: { bold: boolean; color: { rgb: string } };
    alignment: { horizontal: string; vertical: string };
    fill?: { fgColor: { rgb: string } };
}

const setHeaderStyle = (worksheet: IWorksheet, headers: string[]): void => {
    headers.forEach((header, colIndex) => {
        const cellAddress = XLSX.utils.encode_cell({ c: colIndex, r: 0 });
        if (!worksheet[cellAddress]) {
            worksheet[cellAddress] = { v: header };
        }
        (worksheet[cellAddress] as { s: IHeaderStyle }).s = {
            ...headerStyle,
            fill: {
                fgColor: {
                    rgb: header === "备注" ? "00B050" : "1F497D",
                },
            },
        } as IHeaderStyle;
    });
};

// 设置列宽
const setColumnWidths = (headers: string[]): Array<{ wch: number }> => {
  return headers.map((header) => {
    if (header === "备注") {
      return { wch: 20 };
    }
    return { wch: 15 };
  });
};

// 转换数据为指定顺序
const transformData = (data: TtextContent[], headerOrder: string[], headerMapping: Record<string, string>): TtextContent[] => {
  return data.map((item) => {
    const orderedItem: Partial<Record<keyof TtextContent, TtextContent[keyof TtextContent] | null>> = {};
    for (const header of headerOrder) {
      const key = Object.keys(headerMapping).find(
        (k) => headerMapping[k] === header
      );
      if (key) {
      orderedItem[header as keyof TtextContent] = (item[key as keyof TtextContent] ?? null);
      }
    }
    return orderedItem as TtextContent;
  });
};

// 创建工作表
const createWorksheet = (data:TtextContent[], headerOrder:string[], headerMapping:Record<string,string>) => {
  const transformedData = transformData(data, headerOrder, headerMapping);
  const worksheet = XLSX.utils.json_to_sheet<TtextContent>(transformedData);
  setHeaderStyle(worksheet as IWorksheet, headerOrder);
  worksheet["!cols"] = setColumnWidths(headerOrder);
  return worksheet;
};


// 导出单个工作表
export const exportToExcel = (data:TtextContent[], fileName = "export.xlsx", headerOrder:string[], headerMapping:Record<string,string>) => {
  const workbook = XLSX.utils.book_new();
  const worksheet = createWorksheet(data, headerOrder, headerMapping);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, fileName);
};

type TExportData =
inferRouterOutputs<AppRouter>["textConfig"]["getExportData"];

// 导出多个工作表
export const exportToExcelWithSheets = (
    data: TExportData,
    fileName = "export.xlsx",
    headerOrder: string[],
    headerMapping: Record<string, string>
): void => {
    const workbook = XLSX.utils.book_new();

    data.forEach((category ) => {
        const sheetName = category.category2 || `Sheet_${category.id}`;
        const worksheet = createWorksheet(category.contents, headerOrder, headerMapping);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    XLSX.writeFile(workbook, fileName);
};
