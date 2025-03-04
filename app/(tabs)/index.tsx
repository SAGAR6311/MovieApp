import { Image, StyleSheet, Platform, Animated } from "react-native";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { fetchTMDBData, endpoints } from "../api/tmdb";
import { FlashList } from "@shopify/flash-list";
import {
  View,
  Text,
  Image as RNImage,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontSizes, FontWeights, Colors } from "../../constants/typography";
import { useNavigation, useRouter, useLocalSearchParams } from "expo-router";

type Category = "nowPlaying" | "popular" | "topRated" | "upcoming" | "search";

const SkeletonLoader = () => (
  <View style={styles.skeletonContainer}>
    {[...Array(5)].map((_, index) => (
      <View key={index} style={styles.skeletonItem}>
        <View style={styles.skeletonImage} />
        <View style={styles.skeletonText} />
      </View>
    ))}
  </View>
);

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] =
    useState<Category>("nowPlaying");
  const [movies, setMovies] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const fetchMoviesData = async () => {
    setLoading(true);
    try {
      let data;
      if (searchQuery.trim()) {
        data = await fetchTMDBData(endpoints.search, {
          query: searchQuery,
          language: "en-US",
          page,
        });
      } else {
        data = await fetchTMDBData(endpoints[selectedCategory], {
          language: "en-US",
          page,
        });
      }
      setMovies((prevMovies) =>
        page === 1 ? data.results : [...prevMovies, ...data.results]
      );
    } catch (err) {
      console.log("Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoviesData();
  }, [selectedCategory, page, searchQuery]);

  const categories: Category[] = [
    "nowPlaying",
    "popular",
    "topRated",
    "upcoming",
  ];

  const animatedValue = useRef(new Animated.Value(0)).current;

  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category);
    setSearchQuery("");
    setPage(1);
    setMovies([]);
    Animated.timing(animatedValue, {
      toValue: categories.indexOf(category),
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleEndReached = () => {
    if (!loading) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setMovies([]);
    fetchMoviesData().finally(() => setRefreshing(false));
  }, []);

  const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

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
      <RNImage
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
      <View>
        <FlatList
          data={categories}
          horizontal
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => handleCategoryChange(item)}
            >
              <Animated.View
                style={[
                  styles.tabItem,
                  selectedCategory === item && styles.activeTab,
                ]}
              >
                <Text style={styles.tabText}>{item.toUpperCase()}</Text>
              </Animated.View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
        />
      </View>
      <TextInput
        style={styles.searchBar}
        placeholder="Search Movies"
        value={searchQuery}
        placeholderTextColor={"#ccc"}
        onChangeText={(text) => {
          setSearchQuery(text);
          setPage(1);
          setMovies([]);
        }}
      />
      {loading ? (
        <SkeletonLoader />
      ) : (
        <FlashList
          data={movies}
          renderItem={renderMovieItem}
          keyExtractor={(item) => item.id.toString()}
          estimatedItemSize={100}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            !loading && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Oops! No movies found 😞</Text>
              </View>
            )
          }
          ListFooterComponent={
            loading && (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
              </View>
            )
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 4,
  },
  tabItem: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: Colors.background,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: Colors.secondary,
  },
  tabText: {
    fontSize: FontSizes.small,
    fontWeight: "500",
    color: Colors.primary,
  },
  searchBar: {
    margin: 10,
    padding: 15,
    borderWidth: 0.2,
    borderRadius: 8,
    backgroundColor: "#333",
    color: Colors.primary,
  },
  movieItem: {
    flexDirection: "row",
    marginHorizontal: 10,
    marginVertical: 5,
    backgroundColor: "#111",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  poster: {
    width: 80,
    height: 120,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  movieInfo: {
    flex: 1,
    justifyContent: "center",
    padding: 10,
  },
  title: {
    fontSize: FontSizes.medium,
    fontWeight: "500",
    color: Colors.primary,
  },
  releaseDate: {
    fontSize: FontSizes.small,
    color: Colors.primary,
  },
  rating: {
    fontSize: FontSizes.small,
    color: Colors.secondary,
    marginTop: 5,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  emptyText: {
    fontSize: FontSizes.medium,
    color: Colors.primary,
    textAlign: "center",
  },
  skeletonContainer: {
    padding: 10,
  },
  skeletonItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  skeletonImage: {
    width: 80,
    height: 80,
    backgroundColor: "#ccc",
    borderRadius: 8,
  },
  skeletonText: {
    flex: 1,
    height: 20,
    backgroundColor: "#ccc",
    marginLeft: 10,
    borderRadius: 4,
  },
});
