import { supabase } from "../supabase";
import type { User } from "@supabase/supabase-js";

export class AuthService {
  async createAccount({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          //   data: {
          //     full_name: name
          //   }
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  async login({ email, password }: { email: string; password: string }) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error("Auth service :: getCurrentUser :: error", error);
      return null;
    }
  }

  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Auth service :: logout :: error", error);
    }
  }

  async resetPassword(email: string) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Auth service :: resetPassword :: error", error);
      throw error;
    }
  }

  async deleteUser(userId: string) {
    try {
      // Start a transaction
      const { error: petError } = await supabase
        .from("pets")
        .delete()
        .eq("owner_id", userId);
      if (petError) throw petError;

      const { error: postLikesError } = await supabase
        .from("post_likes")
        .delete()
        .eq("user_id", userId);
      if (postLikesError) throw postLikesError;

      const { error: postCommentsError } = await supabase
        .from("post_comments")
        .delete()
        .eq("user_id", userId);
      if (postCommentsError) throw postCommentsError;

      const { error: socialPostsError } = await supabase
        .from("social_posts")
        .delete()
        .eq("user_id", userId);
      if (socialPostsError) throw socialPostsError;

      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);
      if (profileError) throw profileError;

      // Finally, delete the user from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) throw authError;

      return {
        success: true,
        message: "User and related data deleted successfully",
      };
    } catch (error) {
      console.error("Auth service :: deleteUser :: error", error);
      throw error;
    }
  }
}

export const authService = new AuthService();
