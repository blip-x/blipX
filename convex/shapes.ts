import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";


export const get = query({
    args: {
        roomId: v.optional(v.id("rooms")),
        workspaceId: v.optional(v.id("workspaces")),
        conversationId: v.optional(v.id("conversations"))
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if(!userId) {
            return null;
        }

        if(!args.roomId && !args.workspaceId) {
            return null;
        }

        let room = null;

        if(args.roomId) {
            room = await ctx.db.get(args.roomId);
        } else if(args.workspaceId && !room) {
            const workspace = await ctx.db.get(args.workspaceId);
            if(!workspace) {
                return null;
            }
            room = await ctx.db.query("rooms").withIndex("by_workspace_id", q => q.eq("workspaceId", workspace._id)).unique();
        }

        if(!room) {
            return null;
        }
        
        const shapes = await ctx.db.query("shapes").withIndex("by_room_id", q => q.eq("roomId", room._id)).collect();
        return shapes;
    }
});