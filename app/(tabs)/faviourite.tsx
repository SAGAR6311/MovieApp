import { StyleSheet, Image, Platform, SafeAreaView } from "react-native";
import { useEffect, useState } from "react";
import {
  FlatList,
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { MOVIE_ACCESS_TOKEN } from "@/constants/api";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/typography";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

export default function Faviourite() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchFavoriteMovies = async () => {
    const url =
      "https://api.themoviedb.org/3/account/21856281/favorite/movies?language=en-US&page=1&sort_by=created_at.asc";
    const options = {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${MOVIE_ACCESS_TOKEN}`,
      },
    };
    setLoading(true);
    try {
      const response = await axios.get(url, options);
      setMovies(response.data.results);
    } catch (err) {
      console.error("Error fetching favorite movies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavoriteMovies();
  }, []);

  const renderMovieItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.movieItem}
      onPress={() =>
        router.push({
          pathname: "/movie",
          params: { movie: JSON.stringify(item) },
        })
      }
    >
      <Image
        source={{ uri: `${IMAGE_BASE_URL}${item.poster_path}` }}
        style={styles.poster}
      />
      <View style={styles.movieInfo}>
        <Text style={styles.title}>{item.title}</Text>
        <Text
          style={styles.releaseDate}
        >{`Release Date: ${item.release_date}`}</Text>
        <Text style={styles.rating}>{`Rating: ${item.vote_average}`}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Favourites</Text>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={movies}
            renderItem={renderMovieItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No favorite movies found.</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 4,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 4,
  },

  movieItem: {
    flexDirection: "row",
    padding: 10,
  },
  poster: {
    width: 80,
    height: 120,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  movieInfo: {
    marginLeft: 10,
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },

  releaseDate: {
    fontSize: 14,
    color: "gray",
  },
  rating: {
    fontSize: 14,
    color: "gray",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "gray",
  },
  loaderContainer: {
    padding: 20,
  },
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  headerContainer: {
    paddingVertical: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
