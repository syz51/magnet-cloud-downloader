"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "convex/react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export function PostsList() {
  const [newPostName, setNewPostName] = useState("");
  const posts = useQuery(api.posts.getAllPosts);
  const createPost = useMutation(api.posts.createPost);
  const deletePost = useMutation(api.posts.deletePost);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPostName.trim()) {
      await createPost({ name: newPostName.trim() });
      setNewPostName("");
    }
  };

  const handleDeletePost = async (postId: Id<"posts">) => {
    await deletePost({ id: postId });
  };

  if (posts === undefined) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading posts...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Posts (Convex Demo)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create new post form */}
        <form onSubmit={handleCreatePost} className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter post name..."
            value={newPostName}
            onChange={(e) => setNewPostName(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="sm">
            <Plus className="mr-1 h-4 w-4" />
            Add Post
          </Button>
        </form>

        {/* Posts list */}
        <div className="space-y-2">
          {posts.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center">
              No posts yet. Create your first post above!
            </p>
          ) : (
            posts.map((post) => (
              <div
                key={post._id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{post.name ?? "Untitled Post"}</p>
                  <p className="text-muted-foreground text-sm">
                    Created: {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeletePost(post._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
