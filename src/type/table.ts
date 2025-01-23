import { z } from 'zod'

// 创建一个通用的搜索输入 Schema 工厂函数
export const createSearchInputSchema = <T extends string>(sortableFields: T[]) => {
    return z.object({
        pageSize: z.number().min(1).max(100),
        page: z.number().min(1).default(1),
        filter: z.string().optional(),
        sort: z
            .object({
                // 动态生成 enum 类型
                ...sortableFields.reduce((acc, field) => {
                    acc[field] = z.enum(['asc', 'desc']);
                    return acc;
                }, {} as Record<T, z.ZodEnum<["asc", "desc"]>>),
            })
            .optional(),
    });
};

// 示例：定义实际的字段
const sortableFields: string[] = ["textId", "name", "date"];

// 使用工厂函数生成 Schema
export const searchInputSchema = createSearchInputSchema(sortableFields);