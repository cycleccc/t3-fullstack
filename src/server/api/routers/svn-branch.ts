import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { createSearchInputSchema } from "@/type/table";
import { parseDate, getDayRange } from "@/lib/date";

const FIELDS_SCHEMA = {
    name: z.string().optional(),
    remark: z.string().optional(),
    createdBy: z.string().optional(),
    createdAt: z.string().optional()
}
const sortableFields: string[] = ["createdAt"];
const searchInputSchema = createSearchInputSchema(sortableFields);


export const svnBranchRouter = createTRPCRouter({
    getSvnBranchesByProjectId: protectedProcedure
        .input(
            z.object({
                projectId: z.number(),
            }),
        )
        .query(async ({ ctx, input }) => {
            const svnBranches = await ctx.db.svnBranch.findMany({
                where: {
                    projectId: input.projectId,
                },
            });
            return svnBranches; // 返回查询结果
        }),
    update: protectedProcedure
        .input(
            z.object({
                id: z.number(),
                remark: z.string().optional(),
                name: z.string().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { id, remark, name } = input;

            // 更新数据库
            const updatedRecord = await ctx.db.svnBranch.update({
                where: { id },
                data: { remark, name }, // 更新字段
            });

            return updatedRecord;
        }),
    create: protectedProcedure
        .input(
            z.object({
                name: z.string(),
                projectId: z.number(),
                createdBy: z.string(),
                createdAt: z.date(),
                remark: z.string().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const newBranch = await ctx.db.svnBranch.create({
                data: {
                    name: input.name,
                    projectId: input.projectId,
                    createdBy: input.createdBy,
                    createdAt: input.createdAt,
                    remark: input.remark,
                },
            });
            return newBranch;
        }),
    delete: protectedProcedure
        .input(
            z.object({
                id: z.number(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            // 删除所有依赖于这个 svnBranch 的 textContent 记录
            await ctx.db.textContent.deleteMany({
                where: {
                    textConfig: {
                        svnBranchId: input.id,
                    },
                },
            });

            // 删除所有依赖于这个 svnBranch 的 textConfig 记录
            await ctx.db.textConfig.deleteMany({
                where: {
                    svnBranchId: input.id,
                },
            });

            // 然后删除 svnBranch
            await ctx.db.svnBranch.delete({
                where: {
                    id: input.id,
                },
            });
            return input.id;
        }),
    getData: protectedProcedure
        .input(
            z.object({
                projectId: z.number(),
            }).merge(searchInputSchema).merge(z.object(FIELDS_SCHEMA)),

        )
        .query(async ({ ctx, input }) => {
            const { page, pageSize, projectId, sort, remark, name, createdBy, ...rest } = input;
            let createdAt = undefined;
            if (input.createdAt) {
                const date = parseDate(input.createdAt);
                const { startOfDay, endOfDay } = getDayRange(date);
                createdAt = {
                    gte: startOfDay,
                    lte: endOfDay,
                };
            }

            const whereClause = {
                projectId,
                ...(remark && { remark: { contains: remark } }),
                ...(name && { name: { contains: name } }),
                ...(createdBy && { createdBy: { contains: createdBy } }),
                ...rest,
                createdAt,
            };

            // 查询总数
            const total = await ctx.db.svnBranch.count({
                where: whereClause,
            });

            // 查询分页数据
            const result = await ctx.db.svnBranch.findMany({
                where: whereClause,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: sort ? { createdAt: sort.createdAt! } : undefined,
            });

            return {
                result,
                total,
                success: true,
            };
        }),
    getCreatorTypes: protectedProcedure
        .input(
            z.object({
                projectId: z.number(),
            }),
        )
        .query(async ({ ctx, input }) => {
            const createdTypes = await ctx.db.svnBranch.findMany({
                where: {
                    projectId: input.projectId,
                },
                distinct: ["createdBy"],
                select: {
                    createdBy: true,
                },
            });
            return createdTypes;
        }),
});
