import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks';

export type Favorite = {
  id: string;
  user_id: string;
  mediaId: number;
  mediaType: 'movie' | 'tv';
};

type FavoritesContextType = {
  favorites: Favorite[];
  isFavorite: (mediaId: number) => boolean;
  addFavorite: (mediaId: number, mediaType: 'movie' | 'tv') => Promise<void>;
  removeFavorite: (mediaId: number) => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  const fetchFavorites = useCallback(async () => {
    if (!user) return;

    const favoritesRef = collection(db, 'favorites');
    const q = query(favoritesRef, where('user_id', '==', user.uid));
    const querySnapshot = await getDocs(q);

    const fetchedFavorites: Favorite[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as Omit<Favorite, 'id'>;
      fetchedFavorites.push({ id: docSnap.id, ...data });
    });

    setFavorites(fetchedFavorites);
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = useCallback(
    (mediaId: number) => {
      return favorites.some((fav) => fav.mediaId === mediaId);
    },
    [favorites]
  );

  const addFavorite = async (mediaId: number, mediaType: 'movie' | 'tv') => {
    if (!user) return;

    const newFav = {
      user_id: user.uid,
      mediaId,
      mediaType,
    };

    const docRef = await addDoc(collection(db, 'favorites'), newFav);
    setFavorites((prev) => [...prev, { id: docRef.id, ...newFav }]);
  };

  const removeFavorite = async (mediaId: number) => {
    if (!user) return;

    const favToRemove = favorites.find(
      (fav) => fav.mediaId === mediaId && fav.user_id === user.uid
    );
    if (!favToRemove) return;

    await deleteDoc(doc(db, 'favorites', favToRemove.id));
    setFavorites((prev) => prev.filter((fav) => fav.id !== favToRemove.id));
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, isFavorite, addFavorite, removeFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
