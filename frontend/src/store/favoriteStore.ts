import { create } from "zustand";
import { persist } from "zustand/middleware";
import {useAuthStore} from "../store";
import axios from "axios";

interface Post {
    id: number;
    title: string;
    content: string | null;
    post_type: 'receive' | 'sell';
    tag: string | null;
    author_id: number;
    created_at: string;
    status: 'active' | 'inactive' | 'deleted';
    price: number;
    campus_id: number;
    images:string[];
  }

  interface FavoriteStoreState {
    token: string | null;
    posts: Post[];
    getPosts: () => Promise<void>;
    addPost: (post: Post) => void;
    removePost: (post: Post) => void;
  }

  const useFavoriteStore = create<FavoriteStoreState>()(
    persist(
        (set, get) => ({
            token:useAuthStore((state) => state.token),
            posts: [],
            getPosts: async () => {
                const { data } = await axios.get<Post[]>(
                    "http://localhost:5000/api/favorites/user/favorites",
                    {
                        headers: {
                            Authorization: `Bearer ${get().token}`,
                        },
                    }
                );
                set({ posts: data });
            },
            addPost: (post) => {
                axios.post("http://localhost:5000/api/favorites/add",post.id,{
                    headers: {
                        Authorization: `Bearer ${get().token}`,
                    },
                })
            },
            
            removePost: (post) => {
                axios.post("http://localhost:5000/api/favorites/add",post.id,{
                    headers: {
                        Authorization: `Bearer ${get().token}`,
                    },
                })
            },
        }),
        {
            name: "favoriteStore",
        }
    )
);

export default useFavoriteStore;