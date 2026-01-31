import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Share,
    Linking,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';
import { Hackathon } from '../types';

const { width } = Dimensions.get('window');

export const HackathonInfo: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { hackathon } = route.params as { hackathon: Hackathon };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out ${hackathon.title} on DevCompass!\n\n${hackathon.original_url}`,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleApply = () => {
        if (hackathon.original_url) {
            Linking.openURL(hackathon.original_url);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'TBA';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <LinearGradient
                        colors={['rgba(245, 166, 35, 0.3)', 'rgba(0,0,0,0)']}
                        style={styles.heroGradient}
                    />
                    <SafeAreaView style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                            <Ionicons name="share-outline" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </SafeAreaView>

                    <View style={styles.heroContent}>
                        <View style={styles.platformBadge}>
                            <Text style={styles.platformText}>
                                {hackathon.platform_source.toUpperCase()}
                            </Text>
                        </View>
                        <Text style={styles.title}>{hackathon.title}</Text>
                        <View style={styles.metaRow}>
                            <View style={styles.metaItem}>
                                <Ionicons name="calendar-outline" size={16} color="#B8B8B8" />
                                <Text style={styles.metaText}>
                                    {formatDate(hackathon.start_date || '')}
                                </Text>
                            </View>
                            <View style={styles.metaItem}>
                                <Ionicons name="location-outline" size={16} color="#B8B8B8" />
                                <Text style={styles.metaText}>
                                    {hackathon.location_mode?.toUpperCase() || 'REMOTE'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Content Section */}
                <View style={styles.content}>
                    {hackathon.prize_money && (
                        <View style={styles.prizeCard}>
                            <LinearGradient
                                colors={['#FFD700', '#F5A623']}
                                style={styles.prizeGradient}
                            >
                                <Ionicons name="trophy" size={24} color="#0A0A0A" />
                                <View style={styles.prizeInfo}>
                                    <Text style={styles.prizeLabel}>Total Prize Pool</Text>
                                    <Text style={styles.prizeAmount}>
                                        {hackathon.prize_money.replace(/<[^>]*>/g, '')}
                                    </Text>
                                </View>
                            </LinearGradient>
                        </View>
                    )}

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Overview</Text>
                        <Text style={styles.description}>
                            {hackathon.description?.replace(/<[^>]*>/g, '') ||
                                'No description available.'}
                        </Text>
                    </View>

                    {hackathon.themes && hackathon.themes.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Themes</Text>
                            <View style={styles.tagContainer}>
                                {hackathon.themes.map((theme, index) => (
                                    <View key={index} style={styles.tag}>
                                        <Text style={styles.tagText}>{theme}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Floating Action Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                    <LinearGradient
                        colors={['#FFD700', '#F5A623']}
                        style={styles.applyGradient}
                    >
                        <Text style={styles.applyText}>REGISTER NOW</Text>
                        <Ionicons name="arrow-forward" size={20} color="#0A0A0A" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A0A',
    },
    heroSection: {
        height: 350,
        justifyContent: 'flex-end',
        backgroundColor: '#1A1A1A',
    },
    heroGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        zIndex: 10,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shareButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroContent: {
        padding: 24,
        paddingBottom: 40,
    },
    platformBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#F5A623',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 12,
    },
    platformText: {
        color: '#0A0A0A',
        fontWeight: '900',
        fontSize: 10,
        letterSpacing: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFF',
        marginBottom: 16,
    },
    metaRow: {
        flexDirection: 'row',
        gap: 20,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        color: '#B8B8B8',
        fontSize: 14,
        fontWeight: '600',
    },
    content: {
        padding: 24,
    },
    prizeCard: {
        marginTop: -40,
        marginBottom: 32,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#F5A623',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    prizeGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        gap: 20,
    },
    prizeInfo: {
        flex: 1,
    },
    prizeLabel: {
        color: '#0A0A0A',
        fontSize: 12,
        fontWeight: '800',
        opacity: 0.7,
        textTransform: 'uppercase',
    },
    prizeAmount: {
        color: '#0A0A0A',
        fontSize: 24,
        fontWeight: '900',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#F5A623',
        marginBottom: 16,
        letterSpacing: 1,
    },
    description: {
        fontSize: 16,
        lineHeight: 26,
        color: '#B8B8B8',
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    tag: {
        backgroundColor: '#1A1A1A',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    tagText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    bottomBar: {
        padding: 24,
        paddingBottom: 40,
        backgroundColor: '#0A0A0A',
        borderTopWidth: 1,
        borderTopColor: '#1A1A1A',
    },
    applyButton: {
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
    },
    applyGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    applyText: {
        color: '#0A0A0A',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 1,
    },
});
