import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";


export const create = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        conversationId: v.optional(v.id("conversations"))
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if(!userId) {
            throw new Error("Unauthenticated");
        }

        const member = await ctx.db.query("members").withIndex("By_workspace_id_user_id", (q) => q.eq("workspaceId", args.workspaceId).eq("userId", userId)).unique();
        if(!member) {
            throw new Error("Unauthenticated");
        }

        const workspace = await ctx.db.get(args.workspaceId);
        if(!workspace) {
            throw new Error("Workspace not exist");
        }

        const room = await ctx.db.query("rooms").withIndex("by_workspace_id", q => q.eq("workspaceId", workspace._id)).unique();
        if(room) {
            return room._id;
        }

        const roomId = await ctx.db.insert("rooms", {
            workspaceId: args.workspaceId,
            memberId: member._id,
            conversationId: args.conversationId
        });

        return roomId;
    }
});

export const get = query({
    args: {
        workspaceId: v.id("workspaces"),
        conversationId: v.optional(v.id("conversations"))
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if(!userId) {
            return null;
        }
        const workspace = await ctx.db.get(args.workspaceId);

        if(!workspace) {
            return null;
        }

        const room = await ctx.db.query("rooms").withIndex("by_workspace_id", q => q.eq("workspaceId", workspace._id)).unique();
        return room;
    }
});