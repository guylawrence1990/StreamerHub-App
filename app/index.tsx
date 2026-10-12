import { useMemo, useState } from 'react';
import { Alert, ImageBackground, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

type PlatformName = 'Twitch' | 'YouTube' | 'Kick';
type Stream = {
  id: number; name: string; game: string; platform: PlatformName;
  viewers: string; title: string; followed: boolean; image: string; url: string;
};

const initialStreams: Stream[] = [
  { id: 1, name: 'shroud', game: 'VALORANT', platform: 'Twitch', viewers: '21.9K', title: 'Ranked grind with the squad', followed: true, image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=900&q=80', url: 'https://www.twitch.tv/shroud' },
  { id: 2, name: 'summit1g', game: 'Escape from Tarkov', platform: 'Twitch', viewers: '28.7K', title: 'New wipe, new adventures', followed: true, image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=900&q=80', url: 'https://www.twitch.tv/summit1g' },
  { id: 3, name: 'Pokimane', game: 'Just Chatting', platform: 'YouTube', viewers: '20.3K', title: 'A little catch-up with everyone', followed: true, image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=900&q=80', url: 'https://www.youtube.com/@Pokimane/live' },
  { id: 4, name: 'ChocoTaco', game: 'Call of Duty: Warzone', platform: 'Kick', viewers: '12.7K', title: 'Late night wins', followed: false, image: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=900&q=80', url: 'https://kick.com' },
  { id: 5, name: 'MrBeast', game: 'Minecraft', platform: 'YouTube', viewers: '124.1K', title: 'Building something ridiculous', followed: false, image: 'https://images.unsplash.com/photo-1603481546238-487240415921?w=900&q=80', url: 'https://www.youtube.com/@MrBeast/live' },
  { id: 6, name: 'xQc', game: 'Just Chatting', platform: 'Kick', viewers: '32.4K', title: 'Reacting to the internet', followed: false, image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&q=80', url: 'https://kick.com/xqc' },
  { id: 7, name: 'Ninja', game: 'Fortnite', platform: 'Twitch', viewers: '18.2K', title: 'Victory royales all evening', followed: false, image: 'https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=900&q=80', url: 'https://www.twitch.tv/ninja' },
  { id: 8, name: 'Ludwig', game: 'Variety', platform: 'YouTube', viewers: '15.6K', title: 'The daily stream', followed: false, image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=900&q=80', url: 'https://www.youtube.com/@ludwig/live' }
];

const colors: Record<PlatformName, string> = { Twitch: '#7040c9', YouTube: '#b92736', Kick: '#147849' };
const filters = ['All', 'Twitch', 'YouTube', 'Kick'] as const;
type Filter = typeof filters[number];
type Page = 'Home' | 'Discover' | 'Following' | 'Profile';

export default function HomeScreen() {
  const [streams, setStreams] = useState(initialStreams);
  const [page, setPage] = useState<Page>('Home');
  const [filter, setFilter] = useState<Filter>('All');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Stream | null>(null);

  const visible = useMemo(() => streams.filter((s) =>
    (filter === 'All' || s.platform === filter) &&
    `${s.name} ${s.game} ${s.title}`.toLowerCase().includes(query.toLowerCase())
  ), [streams, filter, query]);

  const toggleFollow = (id: number) => setStreams((old) =>
    old.map((s) => s.id === id ? { ...s, followed: !s.followed } : s)
  );

  const openStream = async (stream: Stream) => {
    try {
      const supported = await Linking.canOpenURL(stream.url);
      if (supported) await Linking.openURL(stream.url);
      else Alert.alert('Unable to open link', 'Try opening this stream in your browser.');
    } catch {
      Alert.alert('Could not open stream', 'Please try again.');
    }
  };

  const Header = () => (
    <View style={styles.header}>
      <View style={styles.logo}><Ionicons name="play" size={25} color="#fff" /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.brand}>Stream<Text style={{ color: '#b69aff' }}>Hub</Text></Text>
        <Text style={styles.muted}>All your streams. One place.</Text>
      </View>
      <Pressable onPress={() => { setPage('Discover'); setSelected(null); }} style={styles.searchButton}>
        <Ionicons name="search" size={21} color="#fff" />
      </Pressable>
    </View>
  );

  const FilterRow = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
      {filters.map((f) => (
        <Pressable key={f} onPress={() => setFilter(f)} style={[styles.chip, filter === f && styles.chipActive]}>
          <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>{f === 'All' ? 'All platforms' : f}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );

  const StreamCard = ({ stream }: { stream: Stream }) => (
    <View style={styles.card}>
      <Pressable onPress={() => setSelected(stream)}>
        <ImageBackground source={{ uri: stream.image }} style={styles.thumbnail} imageStyle={styles.thumbnailImage}>
          <View style={styles.livePill}><Text style={styles.liveText}>● LIVE</Text></View>
          <View style={styles.viewerPill}><Ionicons name="eye" size={11} color="#fff" /><Text style={styles.viewerText}>{stream.viewers}</Text></View>
        </ImageBackground>
        <View style={styles.cardInfo}>
          <View style={styles.cardTitleRow}>
            <Text numberOfLines={1} style={styles.streamer}>{stream.name}</Text>
            <View style={[styles.platformBadge, { backgroundColor: colors[stream.platform] }]}>
              <Text style={styles.platformText}>{stream.platform}</Text>
            </View>
          </View>
          <Text numberOfLines={1} style={styles.mutedSmall}>{stream.game}</Text>
          <Text numberOfLines={2} style={styles.streamTitle}>{stream.title}</Text>
        </View>
      </Pressable>
      <Pressable onPress={() => toggleFollow(stream.id)} style={styles.followButton}>
        <Ionicons name={stream.followed ? 'heart' : 'heart-outline'} size={15} color={stream.followed ? '#c4a6ff' : '#ddd'} />
        <Text style={styles.followText}>{stream.followed ? 'Following' : 'Follow'}</Text>
      </Pressable>
    </View>
  );

  const Grid = ({ items }: { items: Stream[] }) => items.length ? (
    <View style={styles.grid}>{items.map((s) => <View key={s.id} style={styles.gridItem}><StreamCard stream={s} /></View>)}</View>
  ) : (
    <View style={styles.empty}><Ionicons name="radio-outline" size={28} color="#88889c" /><Text style={styles.muted}>No streams found. Try another filter or search.</Text></View>
  );

  const Detail = ({ stream }: { stream: Stream }) => (
    <View style={styles.detailCard}>
      <ImageBackground source={{ uri: stream.image }} style={styles.detailImage} imageStyle={styles.thumbnailImage}>
        <View style={styles.livePill}><Text style={styles.liveText}>● LIVE</Text></View>
      </ImageBackground>
      <View style={styles.cardInfo}>
        <Text style={styles.detailName}>{stream.name}</Text>
        <Text style={styles.muted}>{stream.platform} · {stream.game} · {stream.viewers} viewers</Text>
        <Text style={styles.streamTitle}>{stream.title}</Text>
        <Pressable onPress={() => openStream(stream)} style={styles.primaryButton}>
          <Text style={styles.primaryText}>Open on {stream.platform}</Text><Ionicons name="open-outline" size={17} color="#fff" />
        </Pressable>
        <Pressable onPress={() => toggleFollow(stream.id)} style={styles.secondaryButton}>
          <Text style={styles.followText}>{stream.followed ? '♥ Following · Unfollow' : '♡ Follow creator'}</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <Header />
      {selected ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable onPress={() => setSelected(null)} style={styles.backButton}><Ionicons name="arrow-back" size={18} color="#c4a6ff" /><Text style={styles.backText}>Back to {page}</Text></Pressable>
          <Detail stream={streams.find(s => s.id === selected.id) ?? selected} />
          <Text style={styles.disclaimer}>Prototype sample data. Stream availability and viewer counts are not live-verified.</Text>
        </ScrollView>
      ) : (
        <ScrollView key={page} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {page === 'Home' && <>
            <View style={styles.headingRow}><Text style={styles.heading}>Your live feed</Text><Text style={styles.mutedSmall}>{visible.length} live</Text></View>
            <View style={styles.callout}><Text style={styles.calloutTitle}>✦  Your creators, first</Text><Text style={styles.mutedSmall}>Followed live channels appear at the top across every platform.</Text></View>
            <FilterRow />
            <Text style={styles.sectionTitle}>Following live · {visible.filter(s => s.followed).length}</Text>
            <Grid items={visible.filter(s => s.followed)} />
            <View style={styles.headingRow}><Text style={styles.sectionTitle}>Discover live</Text><Pressable onPress={() => setPage('Discover')}><Text style={styles.link}>Explore →</Text></Pressable></View>
            <Grid items={visible.filter(s => !s.followed)} />
          </>}
          {page === 'Discover' && <>
            <Text style={styles.heading}>Discover</Text><Text style={styles.muted}>Find your next favourite creator.</Text>
            <TextInput value={query} onChangeText={setQuery} placeholder="Search creators, games..." placeholderTextColor="#77778b" style={styles.searchInput} autoCapitalize="none" />
            <FilterRow />
            <Grid items={visible} />
          </>}
          {page === 'Following' && <>
            <Text style={styles.heading}>Following</Text><Text style={styles.muted}>Your favourite creators across all platforms.</Text>
            <FilterRow />
            <Grid items={visible.filter(s => s.followed)} />
          </>}
          {page === 'Profile' && <View style={styles.profile}>
            <View style={styles.profileIcon}><Ionicons name="person" size={30} color="#c4a6ff" /></View>
            <Text style={styles.heading}>Your StreamHub</Text><Text style={styles.muted}>Prototype profile</Text>
            <View style={styles.statRow}><Text style={styles.muted}>Followed creators</Text><Text style={styles.stat}>{streams.filter(s => s.followed).length}</Text></View>
            <View style={styles.statRow}><Text style={styles.muted}>Platforms</Text><Text style={styles.stat}>3</Text></View>
            <Text style={styles.mutedSmall}>Accounts, synced preferences and notifications can be added later.</Text>
          </View>}
        </ScrollView>
      )}
      {!selected && <View style={styles.tabBar}>
        {([
          ['Home', 'home-outline'], ['Discover', 'compass-outline'], ['Following', 'heart-outline'], ['Profile', 'person-outline']
        ] as const).map(([name, icon]) => (
          <Pressable key={name} onPress={() => { setPage(name); setSelected(null); }} style={[styles.tab, page === name && styles.tabActive]}>
            <Ionicons name={icon} size={20} color={page === name ? '#c4a6ff' : '#9292a5'} />
            <Text style={[styles.tabLabel, page === name && styles.tabLabelActive]}>{name}</Text>
          </Pressable>
        ))}
      </View>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0b0b12' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  logo: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#7138ef', alignItems: 'center', justifyContent: 'center' },
  brand: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.7 },
  muted: { color: '#a1a1b4', fontSize: 13, marginTop: 3 },
  mutedSmall: { color: '#a1a1b4', fontSize: 11, marginTop: 5 },
  searchButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#1a1a26', alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, marginTop: 4 },
  heading: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 5 },
  sectionTitle: { color: '#fff', fontSize: 15, fontWeight: '750', marginTop: 17, marginBottom: 12 },
  link: { color: '#c4a6ff', fontSize: 12, fontWeight: '600' },
  callout: { backgroundColor: '#211638', borderColor: '#49316c', borderWidth: 1, borderRadius: 13, padding: 13, marginBottom: 14 },
  calloutTitle: { color: '#e4d7ff', fontWeight: '700', fontSize: 13, marginBottom: 4 },
  filterRow: { flexDirection: 'row', gap: 8, paddingVertical: 3, marginBottom: 7 },
  chip: { borderWidth: 1, borderColor: '#383849', borderRadius: 20, paddingHorizontal: 13, paddingVertical: 8 },
  chipActive: { backgroundColor: '#7138ef', borderColor: '#7138ef' },
  chipText: { color: '#c5c5d2', fontSize: 12 },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
  gridItem: { width: '50%', paddingHorizontal: 5, marginBottom: 10 },
  card: { backgroundColor: '#191923', borderColor: '#30303e', borderWidth: 1, borderRadius: 13, overflow: 'hidden', flex: 1 },
  thumbnail: { height: 100, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'flex-start', padding: 7, backgroundColor: '#29233b' },
  thumbnailImage: { borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  livePill: { backgroundColor: '#df354d', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 4 },
  liveText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  viewerPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#000b', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 5, alignSelf: 'flex-end', marginTop: 63 },
  viewerText: { color: '#fff', fontSize: 9 },
  cardInfo: { padding: 10 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4 },
  streamer: { color: '#fff', fontSize: 12, fontWeight: '800', flexShrink: 1 },
  platformBadge: { borderRadius: 4, paddingHorizontal: 5, paddingVertical: 3 },
  platformText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  streamTitle: { color: '#d5d5e1', fontSize: 11, marginTop: 8, lineHeight: 15 },
  followButton: { marginHorizontal: 9, marginBottom: 9, borderWidth: 1, borderColor: '#414153', borderRadius: 8, padding: 7, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  followText: { color: '#e4e4ef', fontSize: 11, fontWeight: '600' },
  empty: { padding: 26, alignItems: 'center', gap: 10, width: '100%' },
  searchInput: { backgroundColor: '#191923', borderWidth: 1, borderColor: '#414153', borderRadius: 10, padding: 12, color: '#fff', marginTop: 17, marginBottom: 12 },
  profile: { backgroundColor: '#191923', borderRadius: 18, borderWidth: 1, borderColor: '#343442', padding: 22, alignItems: 'center', marginTop: 12 },
  profileIcon: { width: 65, height: 65, borderRadius: 22, backgroundColor: '#30214a', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  statRow: { width: '100%', borderBottomWidth: 1, borderBottomColor: '#333342', paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between' },
  stat: { color: '#fff', fontWeight: '800' },
  tabBar: { flexDirection: 'row', paddingHorizontal: 8, paddingTop: 8, paddingBottom: 5, borderTopWidth: 1, borderTopColor: '#292938', backgroundColor: '#11111c', gap: 5 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: 10 },
  tabActive: { backgroundColor: '#2c2047' },
  tabLabel: { color: '#9292a5', fontSize: 10 },
  tabLabelActive: { color: '#c4a6ff', fontWeight: '700' },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 15, paddingVertical: 8 },
  backText: { color: '#c4a6ff', fontSize: 13 },
  detailCard: { backgroundColor: '#191923', borderRadius: 15, overflow: 'hidden', borderWidth: 1, borderColor: '#30303e' },
  detailImage: { height: 190, padding: 10, backgroundColor: '#29233b' },
  detailName: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  primaryButton: { backgroundColor: '#7138ef', borderRadius: 10, padding: 13, marginTop: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  secondaryButton: { backgroundColor: '#292938', borderRadius: 10, padding: 12, marginTop: 9, alignItems: 'center' },
  disclaimer: { color: '#858599', fontSize: 11, textAlign: 'center', marginTop: 15, lineHeight: 16 }
});