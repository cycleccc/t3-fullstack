import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { createSearchInputSchema } from "@/type/table";
import { getDayRange, parseDate } from "@/lib/date";

const FIELDS_SCHEMA = {
    category1: z.string().optional(),
    category2: z.string().optional(),
    startId: z.number().optional(),
    endId: z.number().optional(),
    createdBy: z.string().optional(),
    updatedAt: z.string().optional(),
}


const sortableFields: string[] = ["textId"];
const searchInputSchema = createSearchInputSchema(sortableFields);

export const textConfigRouter = createTRPCRouter({
    getTextConfigBySvnBranchId: protectedProcedure
        .input(
            z.object({
                svnBranchId: z.union([z.string(), z.number()])
            })
        )
        .query(async ({ ctx, input }) => {
            const textConfigs = await ctx.db.textConfig.findMany({
                where: input.svnBranchId !== 'ALL' ? { svnBranchId: typeof input.svnBranchId === 'number' ? input.svnBranchId : undefined } : {},
            });
            return textConfigs;
        }),
    getData: protectedProcedure
        .input(
            z.object({
                svnBranchId: z.union([z.string(), z.number()]),
            }).merge(searchInputSchema).merge(z.object(FIELDS_SCHEMA)),
        )
        .query(async ({ ctx, input }) => {
            const { page, pageSize, svnBranchId, ...rest } = input;
            let updatedAt = undefined;
            if (input.updatedAt) {
                const date = parseDate(input.updatedAt);
                const { startOfDay, endOfDay } = getDayRange(date);
                updatedAt = {
                    gte: startOfDay,
                    lte: endOfDay,
                };
            }

            const whereClause = {
                ...(typeof svnBranchId === 'number' && { svnBranchId: svnBranchId }),
                ...rest,
                updatedAt,
            };

            // 查询总数
            const total = await ctx.db.textConfig.count({
                where: whereClause,
            });

            // 查询分页数据
            const result = await ctx.db.textConfig.findMany({
                where: whereClause,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: {
                    updatedAt: 'desc',
                },
            });

            return {
                filter: z.string().optional(),
                result,
                total,
                success: true,
            };
        }),
    update: protectedProcedure
        .input(
            z.object({
                id: z.number(), // 需要更新的记录 ID
                category2: z.string(), // 更新的字段
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { id, category2 } = input;

            // 更新数据库
            const updatedRecord = await ctx.db.textConfig.update({
                where: { id }, // 根据 ID 查找记录
                data: { category2 }, // 更新字段
            });

            return updatedRecord;
        }),
    delete: protectedProcedure
        .input(
            z.object({
                id: z.number(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            await ctx.db.textContent.deleteMany({
                where: {
                    configId: input.id,
                },
            });
            await ctx.db.textConfig.delete({
                where: {
                    id: input.id,
                },
            });
            return input.id;
        }),
    getCreatorTypes: protectedProcedure
        .input(z.object({
            svnBranchId: z.union([z.string(), z.number()])
        }))
        .query(async ({ ctx, input }) => {
            const createdTypes = await ctx.db.textConfig.findMany({
                where: input.svnBranchId !== 'ALL' ? { svnBranchId: typeof input.svnBranchId === 'number' ? input.svnBranchId : undefined } : {},
                distinct: ['createdBy'],
                select: {
                    createdBy: true,
                },
            });
            return createdTypes;
        }),
    create: protectedProcedure
        .input(
            z.object({
                svnBranchId: z.number(),
                category1: z.string(),
                category2: z.string(),
                startId: z.number(),
                endId: z.number(),
                createdBy: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const newConfig = await ctx.db.textConfig.create({
                data: {
                    svnBranchId: input.svnBranchId,
                    category1: input.category1,
                    category2: input.category2,
                    startId: input.startId,
                    endId: input.endId,
                    createdBy: input.createdBy,
                },
            });
            return newConfig;
        }),
    getIdRanges: protectedProcedure
    .input(
        z.object({
            category1: z.string(),
        })).query(async ({ ctx, input }) => { 
            const idRanges = await ctx.db.textConfig.findMany({
                where: { category1: input.category1 },
                select: {
                    startId: true,
                    endId: true,
                }
            });
            return idRanges;
        }),
    getExportData: protectedProcedure
        .input(
            z.object({
                category1: z.string(),
            }))
        .mutation(async ({ ctx, input }) => {
            const category2List = await ctx.db.textConfig.findMany({
                where: { category1: input.category1 },
                select: {
                    category2: true,
                    id: true,
                }
            });
            const exportData = []
            for (const { id, category2 } of category2List) {
                const contents = await ctx.db.textContent.findMany({
                    where: { configId: id }
                })
                const data = {
                    id, category2,
                    contents
                }
                exportData.push(data)
            }
            return exportData;
        }),
});