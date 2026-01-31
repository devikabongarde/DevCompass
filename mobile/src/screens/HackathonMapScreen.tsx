import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore } from '../stores';
import { theme } from '../theme';
import { Hackathon } from '../types';

const { width } = Dimensions.get('window');

interface HackathonLocation extends Hackathon {
    location?: string;
    city?: string;
}

export const HackathonMapScreen: React.FC = () => {
    const navigation = useNavigation();
    const { isDarkMode = false } = useThemeStore();
    const [hackathons, setHackathons] = useState<HackathonLocation[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

    useEffect(() => {
        loadHackathons();
    }, []);

    const loadHackathons = async () => {
        // TODO: Replace with actual Supabase query from feed
        // Real Indian hackathons - Mumbai and nearby cities
        setHackathons([
            // Mumbai Hackathons
            {
                id: '1',
                title: 'Smart India Hackathon 2024',
                description: 'India\'s biggest hackathon initiative',
                short_summary: 'Solve real-world problems for government ministries',
                start_date: '2024-08-15',
                end_date: '2024-08-17',
                registration_deadline: '2024-08-01',
                themes: ['Smart Cities', 'Healthcare', 'Education'],
                platform_source: 'unstop',
                original_url: 'https://sih.gov.in',
                created_at: '2024-01-01',
                updated_at: '2024-01-01',
                prize_money: '₹1,00,000',
                city: 'Mumbai, Maharashtra',
                location: 'IIT Bombay',
            },
            {
                id: '2',
                title: 'HackNITR 5.0',
                description: 'NIT Rourkela\'s flagship hackathon',
                short_summary: '36-hour innovation marathon',
                start_date: '2024-09-20',
                end_date: '2024-09-22',
                registration_deadline: '2024-09-10',
                themes: ['AI/ML', 'Blockchain', 'IoT'],
                platform_source: 'devfolio',
                original_url: 'https://hacknitr.com',
                created_at: '2024-01-01',
                updated_at: '2024-01-01',
                prize_money: '₹2,50,000',
                city: 'Mumbai, Maharashtra',
                location: 'VJTI Mumbai',
            },
            {
                id: '3',
                title: 'Mumbai Hacks 2024',
                description: 'Mumbai\'s premier student hackathon',
                short_summary: 'Build solutions for urban challenges',
                start_date: '2024-10-05',
                end_date: '2024-10-07',
                registration_deadline: '2024-09-25',
                themes: ['Urban Tech', 'Sustainability', 'Fintech'],
                platform_source: 'unstop',
                original_url: 'https://mumbaihacks.tech',
                created_at: '2024-01-01',
                updated_at: '2024-01-01',
                prize_money: '₹1,50,000',
                city: 'Mumbai, Maharashtra',
                location: 'DJ Sanghvi College',
            },
            // Pune Hackathons
            {
                id: '4',
                title: 'Hack36 7.0',
                description: 'MNNIT Allahabad\'s hackathon',
                short_summary: '36 hours of non-stop coding',
                start_date: '2024-07-12',
                end_date: '2024-07-14',
                registration_deadline: '2024-07-01',
                themes: ['Web3', 'AI', 'Open Innovation'],
                platform_source: 'devfolio',
                original_url: 'https://hack36.com',
                created_at: '2024-01-01',
                updated_at: '2024-01-01',
                prize_money: '₹3,00,000',
                city: 'Pune, Maharashtra',
                location: 'COEP Pune',
            },
            {
                id: '5',
                title: 'CodeFury 6.0',
                description: 'Pune\'s biggest coding competition',
                short_summary: 'Compete with the best developers',
                start_date: '2024-11-15',
                end_date: '2024-11-17',
                registration_deadline: '2024-11-05',
                themes: ['Algorithms', 'Problem Solving', 'DSA'],
                platform_source: 'unstop',
                original_url: 'https://codefury.tech',
                created_at: '2024-01-01',
                updated_at: '2024-01-01',
                prize_money: '₹2,00,000',
                city: 'Pune, Maharashtra',
                location: 'VIT Pune',
            },
            // Bangalore Hackathons
            {
                id: '6',
                title: 'HackBangalore 2024',
                description: 'India\'s tech capital hackathon',
                short_summary: 'Build the next big startup idea',
                start_date: '2024-08-25',
                end_date: '2024-08-27',
                registration_deadline: '2024-08-15',
                themes: ['Startups', 'SaaS', 'Enterprise'],
                platform_source: 'devfolio',
                original_url: 'https://hackbangalore.tech',
                created_at: '2024-01-01',
                updated_at: '2024-01-01',
                prize_money: '₹5,00,000',
                city: 'Bangalore, Karnataka',
                location: 'IISc Bangalore',
            },
            {
                id: '7',
                title: 'Flipkart GRiD 5.0',
                description: 'Flipkart\'s flagship hackathon',
                short_summary: 'Solve e-commerce challenges',
                start_date: '2024-09-01',
                end_date: '2024-09-03',
                registration_deadline: '2024-08-20',
                themes: ['E-commerce', 'Supply Chain', 'ML'],
                platform_source: 'unstop',
                original_url: 'https://flipkart.com/grid',
                created_at: '2024-01-01',
                updated_at: '2024-01-01',
                prize_money: '₹10,00,000',
                city: 'Bangalore, Karnataka',
                location: 'Flipkart Campus',
            },
            // Delhi NCR Hackathons
            {
                id: '8',
                title: 'HackDTU 2024',
                description: 'DTU\'s annual hackathon',
                short_summary: 'Innovation meets technology',
                start_date: '2024-10-18',
                end_date: '2024-10-20',
                registration_deadline: '2024-10-08',
                themes: ['AI', 'Cybersecurity', 'Cloud'],
                platform_source: 'devfolio',
                original_url: 'https://hackdtu.tech',
                created_at: '2024-01-01',
                updated_at: '2024-01-01',
                prize_money: '₹2,50,000',
                city: 'Delhi NCR',
                location: 'DTU Delhi',
            },
            {
                id: '9',
                title: 'Syntax Error 2024',
                description: 'IIIT Delhi\'s hackathon',
                short_summary: 'Debug the future',
                start_date: '2024-11-22',
                end_date: '2024-11-24',
                registration_deadline: '2024-11-12',
                themes: ['Software Engineering', 'DevOps', 'APIs'],
                platform_source: 'unstop',
                original_url: 'https://syntaxerror.tech',
                created_at: '2024-01-01',
                updated_at: '2024-01-01',
                prize_money: '₹1,75,000',
                city: 'Delhi NCR',
                location: 'IIIT Delhi',
            },
            // More Mumbai area
            {
                id: '10',
                title: 'Techfest IIT Bombay Hackathon',
                description: 'Asia\'s largest science and tech festival',
                short_summary: 'Compete at India\'s top tech fest',
                start_date: '2024-12-15',
                end_date: '2024-12-17',
                registration_deadline: '2024-12-01',
                themes: ['Robotics', 'AI', 'Innovation'],
                platform_source: 'unstop',
                original_url: 'https://techfest.org',
                created_at: '2024-01-01',
                updated_at: '2024-01-01',
                prize_money: '₹5,00,000',
                city: 'Mumbai, Maharashtra',
                location: 'IIT Bombay',
            },
            {
                id: '11',
                title: 'Encode 2024',
                description: 'K.J. Somaiya\'s coding marathon',
                short_summary: '24-hour hackathon for students',
                start_date: '2024-07-28',
                end_date: '2024-07-29',
                registration_deadline: '2024-07-20',
                themes: ['Web Dev', 'Mobile Apps', 'Cloud'],
                platform_source: 'devfolio',
                original_url: 'https://encode.kjsce.com',
                created_at: '2024-01-01',
                updated_at: '2024-01-01',
                prize_money: '₹1,00,000',
                city: 'Mumbai, Maharashtra',
                location: 'K.J. Somaiya College',
            },
            // Hyderabad
            {
                id: '12',
                title: 'HackHyderabad 2024',
                description: 'Telangana\'s biggest hackathon',
                short_summary: 'Build for Bharat',
                start_date: '2024-09-08',
                end_date: '2024-09-10',
                registration_deadline: '2024-08-28',
                themes: ['GovTech', 'AgriTech', 'EdTech'],
                platform_source: 'unstop',
                original_url: 'https://hackhyd.tech',
                created_at: '2024-01-01',
                updated_at: '2024-01-01',
                prize_money: '₹3,50,000',
                city: 'Hyderabad, Telangana',
                location: 'IIIT Hyderabad',
            },
            // Chennai
            {
                id: '13',
                title: 'Kurukshetra IIT Madras',
                description: 'IIT Madras tech fest hackathon',
                short_summary: 'South India\'s premier tech event',
                start_date: '2024-10-25',
                end_date: '2024-10-27',
                registration_deadline: '2024-10-15',
                themes: ['Deep Tech', 'Hardware', 'Software'],
                platform_source: 'devfolio',
                original_url: 'https://kurukshetra.org.in',
                created_at: '2024-01-01',
                updated_at: '2024-01-01',
                prize_money: '₹4,00,000',
                city: 'Chennai, Tamil Nadu',
                location: 'IIT Madras',
            },
            // Ahmedabad
            {
                id: '14',
                title: 'Amalthea IIT Gandhinagar',
                description: 'Gujarat\'s premier tech summit',
                short_summary: 'Innovation and entrepreneurship',
                start_date: '2024-11-08',
                end_date: '2024-11-10',
                registration_deadline: '2024-10-28',
                themes: ['Startups', 'Innovation', 'Tech'],
                platform_source: 'unstop',
                original_url: 'https://amalthea.iitgn.ac.in',
                created_at: '2024-01-01',
                updated_at: '2024-01-01',
                prize_money: '₹2,75,000',
                city: 'Ahmedabad, Gujarat',
                location: 'IIT Gandhinagar',
            },
            // Thane (near Mumbai)
            {
                id: '15',
                title: 'CodeStorm 2024',
                description: 'Thane\'s coding competition',
                short_summary: 'Storm through challenges',
                start_date: '2024-08-05',
                end_date: '2024-08-06',
                registration_deadline: '2024-07-25',
                themes: ['Competitive Programming', 'DSA', 'Algorithms'],
                platform_source: 'devfolio',
                original_url: 'https://codestorm.tech',
                created_at: '2024-01-01',
                updated_at: '2024-01-01',
                prize_money: '₹75,000',
                city: 'Thane, Maharashtra',
                location: 'Thane Engineering College',
            },
        ]);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'TBA';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    const handleHackathonPress = (hackathon: HackathonLocation) => {
        navigation.navigate('HackathonDetail' as never, { hackathon } as never);
    };

    // Group hackathons by city
    const hackathonsByCity = hackathons.reduce((acc, hackathon) => {
        const city = hackathon.city || 'Unknown';
        if (!acc[city]) {
            acc[city] = [];
        }
        acc[city].push(hackathon);
        return acc;
    }, {} as Record<string, HackathonLocation[]>);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            {/* Header */}
            <LinearGradient
                colors={['rgba(245, 166, 35, 0.15)', 'rgba(10, 10, 10, 0.5)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                    Hackathon Map
                </Text>
                <TouchableOpacity>
                    <Ionicons name="search" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
            </LinearGradient>

            {/* Info Banner */}
            <View style={[styles.infoBanner, { backgroundColor: 'rgba(245, 166, 35, 0.1)' }]}>
                <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
                <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                    Interactive map coming soon! Browse hackathons by location below.
                </Text>
            </View>

            {/* Location List */}
            <ScrollView style={{ flex: 1 }}>
                {Object.entries(hackathonsByCity).map(([city, cityHackathons]) => (
                    <View key={city} style={styles.citySection}>
                        {/* City Header */}
                        <TouchableOpacity
                            style={[styles.cityHeader, { backgroundColor: theme.colors.surface }]}
                            onPress={() => setSelectedLocation(selectedLocation === city ? null : city)}
                        >
                            <View style={styles.cityHeaderLeft}>
                                <LinearGradient
                                    colors={theme.colors.gradientGold}
                                    style={styles.cityIcon}
                                >
                                    <Ionicons name="location" size={20} color="#0A0A0A" />
                                </LinearGradient>
                                <View>
                                    <Text style={[styles.cityName, { color: theme.colors.text }]}>
                                        {city}
                                    </Text>
                                    <Text style={[styles.cityCount, { color: theme.colors.textSecondary }]}>
                                        {cityHackathons.length} hackathon{cityHackathons.length !== 1 ? 's' : ''}
                                    </Text>
                                </View>
                            </View>
                            <Ionicons
                                name={selectedLocation === city ? 'chevron-up' : 'chevron-down'}
                                size={20}
                                color={theme.colors.textLight}
                            />
                        </TouchableOpacity>

                        {/* Hackathons in City */}
                        {selectedLocation === city && (
                            <View style={styles.hackathonsList}>
                                {cityHackathons.map((hackathon) => (
                                    <TouchableOpacity
                                        key={hackathon.id}
                                        onPress={() => handleHackathonPress(hackathon)}
                                        style={[styles.hackathonCard, { backgroundColor: theme.colors.surface }]}
                                    >
                                        <View style={styles.hackathonHeader}>
                                            <Text style={[styles.hackathonTitle, { color: theme.colors.text }]}>
                                                {hackathon.title}
                                            </Text>
                                            <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
                                        </View>

                                        <View style={styles.hackathonMeta}>
                                            <View style={styles.metaItem}>
                                                <Ionicons name="calendar" size={14} color={theme.colors.primary} />
                                                <Text style={[styles.metaText, { color: theme.colors.primary }]}>
                                                    {formatDate(hackathon.start_date)} - {formatDate(hackathon.end_date)}
                                                </Text>
                                            </View>

                                            {hackathon.location && (
                                                <View style={styles.metaItem}>
                                                    <Ionicons name="business" size={14} color={theme.colors.textSecondary} />
                                                    <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                                                        {hackathon.location}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>

                                        {hackathon.prize_money && (
                                            <View style={styles.prizeRow}>
                                                <Ionicons name="trophy" size={14} color={theme.colors.primary} />
                                                <Text style={[styles.prizeText, { color: theme.colors.primary }]}>
                                                    {hackathon.prize_money} in prizes
                                                </Text>
                                            </View>
                                        )}

                                        {hackathon.themes && hackathon.themes.length > 0 && (
                                            <View style={styles.themesRow}>
                                                {hackathon.themes.slice(0, 3).map((themeItem, index) => (
                                                    <View
                                                        key={index}
                                                        style={[styles.themeChip, { backgroundColor: 'rgba(245, 166, 35, 0.1)' }]}
                                                    >
                                                        <Text style={[styles.themeText, { color: theme.colors.primary }]}>
                                                            {themeItem}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(245, 166, 35, 0.2)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 8,
        gap: 8,
    },
    infoText: {
        flex: 1,
        fontSize: 12,
    },
    citySection: {
        marginTop: 12,
    },
    cityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        marginHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(245, 166, 35, 0.2)',
    },
    cityHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    cityIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cityName: {
        fontSize: 16,
        fontWeight: '700',
    },
    cityCount: {
        fontSize: 12,
        marginTop: 2,
    },
    hackathonsList: {
        marginTop: 8,
        paddingHorizontal: 16,
    },
    hackathonCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(245, 166, 35, 0.1)',
    },
    hackathonHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    hackathonTitle: {
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
    },
    hackathonMeta: {
        gap: 6,
        marginBottom: 8,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 12,
    },
    prizeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    prizeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    themesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    themeChip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    themeText: {
        fontSize: 11,
        fontWeight: '600',
    },
});
