import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { languages } from "@/app/text-content/_components/columns";
import { createSearchInputSchema } from "@/type/table";

const FIELDS_SCHEMA = {
    textId: z.number().optional(),
    paramCount: z.number().optional(),
    contentCn: z.string().optional(),
    remark: z.string().optional()
}
const sortableFields: string[] = ["textId"];
const searchInputSchema = createSearchInputSchema(sortableFields);

export const textContentRouter = createTRPCRouter({
    gettextContentByConfigId: protectedProcedure
        .input(
            z.object({
                configId: z.number(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const textContents = await ctx.db.textContent.findMany({
                where: {
                    configId: input.configId,
                },
            });
            return textContents;
        }),

    getData: protectedProcedure
        .input(
            z.object({
                configId: z.number(),
            }).merge(searchInputSchema).merge(z.object(FIELDS_SCHEMA)),
        )
        .query(async ({ ctx, input }) => {
            const { page, pageSize, configId, sort, contentCn, remark, ...rest } = input;

            const whereClause = {
                configId,
                ...(contentCn && { contentCn: { contains: contentCn } }),
                ...(remark && { remark: { contains: remark } }),
                ...rest
            };

            // 查询总数
            const total = await ctx.db.textContent.count({
                where: whereClause,
            });

            // 查询分页数据
            const result = await ctx.db.textContent.findMany({
                where: whereClause,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: sort ? { textId: sort.textId! } : undefined,
            });

            return {
                result,
                total,
                success: true,
            };
        }),

    update: protectedProcedure
        .input(
            z.object({
                id: z.number(),
                remark: z.string().optional(),
                contentCn: z.string().optional(),
                ...Object.fromEntries(languages.map((lang) => [lang.key, z.string().optional()])),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { id, remark, contentCn, ...contentUpdates } = input;

            // Remove undefined fields
            const dataToUpdate = Object.fromEntries(
                Object.entries(contentUpdates).filter(([_, v]) => v !== undefined)
            );

            const updatedRecord = await ctx.db.textContent.update({
                where: { id },
                data: { remark, contentCn, ...dataToUpdate },
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
            await ctx.db.textContent.delete({
                where: {
                    id: input.id,
                },
            });
            return input.id;
        }),
    createWithUniqueTextId: protectedProcedure
        .input(
            z.object({
                configId: z.number(), // 配置ID
                paramCount: z.number(), // 参数计数
                contentCn: z.string(), // 内容
                remark: z.string().optional(), // 备注
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { configId, paramCount, contentCn, remark } = input;

            const range = await ctx.db.textConfig.findFirst({
                where: { id: configId },
                select: {
                    startId: true,
                    endId: true,
                },
            });

            if (!range) {
                throw new Error(`未找到 configId ${ configId } 的 ID 范围配置`);
            }

            const { startId, endId } = range;

            // 2. 查找范围内已存在的 textId
            const existingTextIds = await ctx.db.textContent.findMany({
                where: {
                    configId,
                    textId: {
                        gte: startId,
                        lte: endId,
                    },
                },
                select: {
                    textId: true,
                },
            });

            const existingTextIdSet = new Set(existingTextIds.map(item => item.textId));

            // 3. 生成唯一的 textId
            let newTextId: number | null = null;
            for (let textId = startId; textId <= endId; textId++) {
                if (!existingTextIdSet.has(textId)) {
                    newTextId = textId;
                    break;
                }
            }

            if (newTextId === null) {
                throw new Error(`configId ${ configId } 的 ID 范围 [${ startId }, ${ endId }] 中没有可用的 textId`);
            }

            // 4. 创建新的记录
            const newBranch = await ctx.db.textContent.create({
                data: {
                    configId,
                    textId: newTextId,
                    paramCount,
                    contentCn,
                    remark,
                },
            });

            return newBranch;
        })
});
