import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
	args: {
		roomId: v.optional(v.id("rooms")),
		workspaceId: v.optional(v.id("workspaces")),
		conversationId: v.optional(v.id("conversations")),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			return null;
		}

		if (!args.roomId && !args.workspaceId) {
			return null;
		}

		let room = null;

		if (args.roomId) {
			room = await ctx.db.get(args.roomId);
		} else if (args.workspaceId && !room) {
			const workspace = await ctx.db.get(args.workspaceId);
			if (!workspace) {
				return null;
			}
			room = await ctx.db
				.query("rooms")
				.withIndex("by_workspace_id", (q) => q.eq("workspaceId", workspace._id))
				.unique();
		}

		if (!room) {
			return null;
		}

		const shapes = await ctx.db
			.query("shapes")
			.withIndex("by_room_id", (q) => q.eq("roomId", room._id))
			.collect();
		return shapes;
	},
});

export const create = mutation({
	args: {
		body: v.string(),
		roomId: v.id("rooms"),
		workspaceId: v.id("workspaces"),
		memberId: v.id("members"),
		conversationId: v.optional(v.id("conversations")),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error("Unauthenticated");
		}

		if (!args.body.trim().length) {
			throw new Error("Shape is required");
		}

		const member = await ctx.db
			.query("members")
			.withIndex("By_workspace_id_user_id", (q) =>
				q.eq("workspaceId", args.workspaceId).eq("userId", userId)
			)
			.unique();
		if (!member || member._id !== args.memberId) {
			throw new Error("Unauthenticated");
		}

		const room = await ctx.db.get(args.roomId);
		if (!room) {
			throw new Error("Room not exist!");
		}

		const shapeId = await ctx.db.insert("shapes", {
			body: args.body,
			roomId: room._id,
			workspaceId: args.workspaceId,
			memberId: member._id,
			conversationId: args.conversationId,
		});
		return shapeId;
	},
});

export const updateById = mutation({
	args: {
		id: v.id("shapes"),
		body: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error("Unauthenticated");
		}

		await ctx.db.patch(args.id, {
			body: args.body,
		});
		return args.id;
	},
});

export const deleteById = mutation({
	args: {
		id: v.id("shapes"),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error("Unauthenticated");
		}

		await ctx.db.delete(args.id);
		return args.id;
	},
});
