import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { Colors, FontSizes, FontWeights } from "../constants/typography";
import axios from "axios";
import Toast from "react-native-toast-message";
import { MOVIE_ACCESS_TOKEN } from "../constants/api";

interface Movie {
  title: string;
  release_date: string;
  vote_average: number;
  overview: string;
  original_language: string;
  popularity: number;
  vote_count: number;
  poster_path: string;
  id: number;
}

export default function MovieDetails() {
  const { movie } = useLocalSearchParams();
  const [movies, setMovies] = useState<Movie | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (typeof movie === "string") {
      setMovies(JSON.parse(movie));
    } else if (Array.isArray(movie) && movie.length > 0) {
      setMovies(JSON.parse(movie[0]));
    }
  }, [movie]);

  const toggleFavorite = async () => {
    if (!movies) return;

    setIsFavorite(!isFavorite);

    const url = `https://api.themoviedb.org/3/account/21856281/favorite`;
    const options = {
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        Authorization: `Bearer ${MOVIE_ACCESS_TOKEN}`,
      },
    };

    try {
      const response = await axios.post(
        url,
        {
          media_type: "movie",
          media_id: movies.id,
          favorite: !isFavorite,
        },
        options
      );
      console.log(response.data);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Favorite status updated successfully!",
        swipeable: true,
        autoHide: true,
        position: "top",
      });
    } catch (error) {
      console.error("Error updating favorite status:", error);
    }
  };

  if (!movies) {
    return <Text style={styles.noDetails}>No movie details available.</Text>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color={Colors.primary} />
      </TouchableOpacity>
      <ScrollView style={styles.container}>
        <Image
          source={{
            uri: `https://image.tmdb.org/t/p/original/${movies.poster_path}`,
          }}
          style={styles.poster}
          resizeMode="stretch"
        />
        <View style={styles.detailsContainer}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.title}>{movies.title}</Text>
            <TouchableOpacity onPress={toggleFavorite}>
              <Icon
                name={isFavorite ? "heart" : "heart-outline"}
                size={32}
                color={isFavorite ? "red" : "gray"}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.releaseDate}>
            Release Date: {movies.release_date}
          </Text>
          <Text style={styles.rating}>Rating: {movies.vote_average}</Text>
          <Text style={styles.overview}>{movies.overview}</Text>
          <Text style={styles.additionalInfo}>
            Original Language: {movies.original_language}
          </Text>
          <Text style={styles.additionalInfo}>
            Popularity: {movies.popularity}
          </Text>
          <Text style={styles.additionalInfo}>
            Vote Count: {movies.vote_count}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  poster: {
    width: "100%",
    height: 400,
  },
  detailsContainer: {
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 8,
  },
  releaseDate: {
    fontSize: FontSizes.medium,
    color: Colors.textLight,
    marginBottom: 4,
  },
  rating: {
    fontSize: FontSizes.medium,
    color: Colors.secondary,
    marginBottom: 8,
  },
  overview: {
    fontSize: FontSizes.medium,
    color: Colors.primary,
    marginBottom: 8,
    textAlign: "justify",
  },
  additionalInfo: {
    fontSize: FontSizes.small,
    color: Colors.textLight,
    marginBottom: 4,
    textAlign: "justify",
  },
  noDetails: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    color: Colors.primary,
    fontSize: FontSizes.medium,
  },
  backButton: {
    padding: 10,
    margin: 5,
  },
});
