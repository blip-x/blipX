import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const generateCode = () => {
  return Array.from({ length: 6 }, () => "01234567890abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 36)]).join("");
}
export const create = mutation({
  args: {
    workspaceName: v.string()
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if(!userId) {
      return new Error("Unauthorized");
    }
    const joinCode = generateCode();
    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.workspaceName,
      userId: userId,
      joinId: joinCode
    });
    await ctx.db.insert("members", {
      userId: userId,
      workspaceId: workspaceId,
      role: "admin"
    });
    await ctx.db.insert("channels", {
      name: "general",
      workspaceId
    });
    return workspaceId;
  }
})
export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if(!userId) return [];

    const members = await ctx.db.query("members").withIndex("by_user_id", (q) => q.eq("userId", userId)).collect();
    const workspaceIds = members.map((m) => m.workspaceId);
    const workspaces = [];

    for(const workspaceId of workspaceIds) {
      const workspace = await ctx.db.get(workspaceId);
      if(workspace) workspaces.push(workspace);
    }
    return workspaces;
  }
});

export const getById = query({ 
  args: {
    id: v.id("workspaces")
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if(userId == null) return null;

    const member = await ctx.db.query("members").withIndex("By_workspace_id_user_id", (q) => q.eq("workspaceId", args.id).eq("userId", userId)).unique();
    if(!member) return null;

    return await ctx.db.get(args.id);
  }
});

export const update = mutation({
  args: {
    id: v.id("workspaces"),
    name: v.string()
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if(!userId) {
      return new Error("Unauthorized");
    }
    const member = await ctx.db.query("members").withIndex("By_workspace_id_user_id", (q) => q.eq("workspaceId", args.id).eq("userId", userId)).unique();
    if(!member || member.role !== "admin") return new Error("Unauthorized");

    await ctx.db.patch(args.id, {
      name: args.name
    });

    return args.id;
  }
})
export const remove = mutation({
  args: {
    id: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if(!userId) {
      return new Error("Unauthorized");
    }
    const member = await ctx.db.query("members").withIndex("By_workspace_id_user_id", (q) => q.eq("workspaceId", args.id).eq("userId", userId)).unique();
    if(!member || member.role !== "admin") return new Error("Unauthorized");

    const [members, channels, conversations, messages, reactions] = await Promise.all([
      ctx.db.query("members").withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id)).collect(),
      ctx.db.query("channels").withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id)).collect(),
      ctx.db.query("conversations").withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id)).collect(),
      ctx.db.query("messages").withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id)).collect(),
      ctx.db.query("reactions").withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id)).collect(),
    ])
    for ( const member of members) {
      await ctx.db.delete(member._id);
    }
    for ( const channel of channels) {
      await ctx.db.delete(channel._id);
    }
    for ( const conversation of conversations) {
      await ctx.db.delete(conversation._id);
    }
    for ( const message of messages) {
      await ctx.db.delete(message._id);
    }
    for ( const reaction of reactions) {
      await ctx.db.delete(reaction._id);
    }
    await ctx.db.delete(args.id);

    return args.id;
  }
});

export const newJoinCode = mutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if(!userId) {
      return new Error("Unauthorized");
    }
    const workspace = await ctx.db.get(args.workspaceId);
    if(!workspace) {
      return new Error("Workspace not found");
    }
    const member = await ctx.db.query("members").withIndex("By_workspace_id_user_id", (q) => 
      q.eq("workspaceId", args.workspaceId).eq("userId", userId)
    ).unique();
    if(!member || member.role !== "admin") {
      return new Error("Unauthorized");
    }
    await ctx.db.patch(args.workspaceId, {
      joinId: generateCode()
    });
    return args.workspaceId;
  },
});

export const join = mutation({
  args: { workspaceId: v.id("workspaces"), joinCode: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if(!userId) {
      return new Error("Unauthorized");
    }
    const workspace = await ctx.db.get(args.workspaceId);
    if(!workspace) {
      return new Error("Workspace not found");
    }
    const member = await ctx.db.query("members").withIndex("By_workspace_id_user_id", (q) => 
      q.eq("workspaceId", args.workspaceId).eq("userId", userId)
    ).unique();
    if(member) {
      return new Error("Already a member of this workspace");
    }
    if(workspace.joinId !== args.joinCode.toLowerCase()) {
      return new Error("Invalid join code");
    }
    await ctx.db.insert("members", {
      userId,
      workspaceId: args.workspaceId,
      role: "member"
    });
    return args.workspaceId;
  },
});

export const getInfoById = query({
  args: { id: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if(!userId) {
      return null;
    }
    const member = await ctx.db.query("members").withIndex("By_workspace_id_user_id", (q) => q.eq("workspaceId", args.id).eq("userId", userId)).unique();
    
    const workspace = await ctx.db.get(args.id);
    if(!workspace) {
      return null;
    }
    return { 
      name: workspace.name,
      isMember: !!member
    };
  }
});
