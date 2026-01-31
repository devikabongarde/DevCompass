import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore } from '../stores';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

interface ProjectIdea {
    id: string;
    title: string;
    description: string;
    stack: string[];
    difficulty: 'Easy' | 'Medium' | 'Hard';
    timeEstimate: string;
    category: string;
}

export const ProjectCopilotScreen: React.FC = () => {
    const navigation = useNavigation();
    const { isDarkMode = false } = useThemeStore();
    const [prompt, setPrompt] = useState('');
    const [selectedIdea, setSelectedIdea] = useState<string | null>(null);

    const projectIdeas: ProjectIdea[] = [
        {
            id: '1',
            title: 'AI-Powered Study Buddy',
            description: 'Smart flashcard app that uses spaced repetition and AI to optimize learning',
            stack: ['React Native', 'Python', 'TensorFlow', 'Firebase'],
            difficulty: 'Medium',
            timeEstimate: '24-36 hours',
            category: 'EdTech',
        },
        {
            id: '2',
            title: 'Carbon Footprint Tracker',
            description: 'Track daily activities and calculate environmental impact with gamification',
            stack: ['Next.js', 'Node.js', 'MongoDB', 'Chart.js'],
            difficulty: 'Easy',
            timeEstimate: '12-24 hours',
            category: 'Sustainability',
        },
        {
            id: '3',
            title: 'Real-time Collaborative Whiteboard',
            description: 'WebRTC-based drawing tool for remote team brainstorming sessions',
            stack: ['React', 'WebRTC', 'Socket.io', 'Canvas API'],
            difficulty: 'Hard',
            timeEstimate: '36-48 hours',
            category: 'Productivity',
        },
    ];

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return '#4CAF50';
            case 'Medium': return '#FFA500';
            case 'Hard': return '#FF4444';
            default: return theme.colors.textLight;
        }
    };

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
                    AI Project Copilot
                </Text>
                <TouchableOpacity>
                    <Ionicons name="sparkles" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={{ flex: 1 }}>
                {/* AI Input */}
                <View style={styles.inputSection}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        What are you interested in building?
                    </Text>
                    <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface }]}>
                        <Ionicons name="bulb-outline" size={20} color={theme.colors.primary} />
                        <TextInput
                            style={[styles.input, { color: theme.colors.text }]}
                            placeholder="e.g., A health tracking app for students..."
                            placeholderTextColor={theme.colors.textLight}
                            value={prompt}
                            onChangeText={setPrompt}
                            multiline
                        />
                    </View>
                    <TouchableOpacity style={styles.generateButton}>
                        <LinearGradient
                            colors={theme.colors.gradientGold}
                            style={styles.generateGradient}
                        >
                            <Ionicons name="sparkles" size={18} color="#0A0A0A" />
                            <Text style={styles.generateText}>Generate Ideas</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Quick Prompts */}
                <View style={styles.quickPromptsSection}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Quick Prompts
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {['FinTech', 'HealthTech', 'EdTech', 'Social Good', 'Gaming'].map((category) => (
                            <TouchableOpacity
                                key={category}
                                style={[styles.quickPrompt, { backgroundColor: 'rgba(245, 166, 35, 0.1)' }]}
                            >
                                <Text style={[styles.quickPromptText, { color: theme.colors.primary }]}>
                                    {category}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* AI Generated Ideas */}
                <View style={styles.ideasSection}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        AI-Generated Ideas
                    </Text>
                    {projectIdeas.map((idea) => (
                        <TouchableOpacity
                            key={idea.id}
                            style={[styles.ideaCard, { backgroundColor: theme.colors.surface }]}
                            onPress={() => setSelectedIdea(selectedIdea === idea.id ? null : idea.id)}
                        >
                            <View style={styles.ideaHeader}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.ideaTitle, { color: theme.colors.text }]}>
                                        {idea.title}
                                    </Text>
                                    <Text style={[styles.ideaCategory, { color: theme.colors.textSecondary }]}>
                                        {idea.category}
                                    </Text>
                                </View>
                                <View style={[styles.difficultyBadge, { backgroundColor: `${getDifficultyColor(idea.difficulty)}20` }]}>
                                    <Text style={[styles.difficultyText, { color: getDifficultyColor(idea.difficulty) }]}>
                                        {idea.difficulty}
                                    </Text>
                                </View>
                            </View>

                            <Text style={[styles.ideaDescription, { color: theme.colors.textSecondary }]}>
                                {idea.description}
                            </Text>

                            <View style={styles.ideaMeta}>
                                <View style={styles.metaItem}>
                                    <Ionicons name="time-outline" size={14} color={theme.colors.primary} />
                                    <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                                        {idea.timeEstimate}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.stackRow}>
                                {idea.stack.map((tech, idx) => (
                                    <View key={idx} style={[styles.stackChip, { backgroundColor: 'rgba(245, 166, 35, 0.1)' }]}>
                                        <Text style={[styles.stackText, { color: theme.colors.primary }]}>
                                            {tech}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            {selectedIdea === idea.id && (
                                <View style={styles.actionsRow}>
                                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: 'rgba(245, 166, 35, 0.1)' }]}>
                                        <Ionicons name="document-text" size={16} color={theme.colors.primary} />
                                        <Text style={[styles.actionText, { color: theme.colors.primary }]}>
                                            Full Plan
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: 'rgba(245, 166, 35, 0.1)' }]}>
                                        <Ionicons name="code-slash" size={16} color={theme.colors.primary} />
                                        <Text style={[styles.actionText, { color: theme.colors.primary }]}>
                                            Architecture
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
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
    inputSection: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(245, 166, 35, 0.2)',
        gap: 8,
    },
    input: {
        flex: 1,
        fontSize: 14,
        minHeight: 60,
    },
    generateButton: {
        marginTop: 12,
        borderRadius: 8,
        overflow: 'hidden',
    },
    generateGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 6,
    },
    generateText: {
        color: '#0A0A0A',
        fontSize: 15,
        fontWeight: '700',
    },
    quickPromptsSection: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    quickPrompt: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    quickPromptText: {
        fontSize: 13,
        fontWeight: '600',
    },
    ideasSection: {
        padding: 16,
    },
    ideaCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(245, 166, 35, 0.1)',
    },
    ideaHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    ideaTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    ideaCategory: {
        fontSize: 12,
        marginTop: 2,
    },
    difficultyBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    difficultyText: {
        fontSize: 11,
        fontWeight: '700',
    },
    ideaDescription: {
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 12,
    },
    ideaMeta: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
    },
    stackRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    stackChip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    stackText: {
        fontSize: 11,
        fontWeight: '600',
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 8,
        gap: 4,
    },
    actionText: {
        fontSize: 12,
        fontWeight: '600',
    },
});
