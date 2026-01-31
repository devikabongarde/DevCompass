import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore } from '../stores';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

interface Task {
    id: string;
    title: string;
    assignee: string;
    priority: 'high' | 'medium' | 'low';
    tags: string[];
}

export const TaskBoardScreen: React.FC = () => {
    const navigation = useNavigation();
    const { isDarkMode = false } = useThemeStore();
    const [tasks, setTasks] = useState({
        todo: [
            { id: '1', title: 'Design landing page mockup', assignee: 'Priya', priority: 'high' as const, tags: ['UI/UX'] },
            { id: '2', title: 'Set up Firebase Auth', assignee: 'Rahul', priority: 'high' as const, tags: ['Backend'] },
            { id: '3', title: 'Create API endpoints', assignee: 'Arjun', priority: 'medium' as const, tags: ['Backend'] },
        ],
        doing: [
            { id: '4', title: 'Build React components', assignee: 'Sneha', priority: 'high' as const, tags: ['Frontend'] },
            { id: '5', title: 'Train ML model', assignee: 'Karan', priority: 'medium' as const, tags: ['ML'] },
        ],
        done: [
            { id: '6', title: 'Project setup', assignee: 'Team', priority: 'low' as const, tags: ['Setup'] },
            { id: '7', title: 'Database schema design', assignee: 'Rahul', priority: 'high' as const, tags: ['Backend'] },
        ],
    });

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return '#FF4444';
            case 'medium': return '#FFA500';
            case 'low': return '#4CAF50';
            default: return theme.colors.textLight;
        }
    };

    const renderTask = (task: Task) => (
        <TouchableOpacity
            key={task.id}
            style={[styles.taskCard, { backgroundColor: theme.colors.surface }]}
        >
            <View style={styles.taskHeader}>
                <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
                <Text style={[styles.taskTitle, { color: theme.colors.text }]} numberOfLines={2}>
                    {task.title}
                </Text>
            </View>

            <View style={styles.taskMeta}>
                <View style={styles.assigneeContainer}>
                    <Ionicons name="person-circle" size={16} color={theme.colors.primary} />
                    <Text style={[styles.assignee, { color: theme.colors.textSecondary }]}>
                        {task.assignee}
                    </Text>
                </View>
                <View style={styles.tagsRow}>
                    {task.tags.map((tag, idx) => (
                        <View key={idx} style={[styles.tag, { backgroundColor: 'rgba(245, 166, 35, 0.1)' }]}>
                            <Text style={[styles.tagText, { color: theme.colors.primary }]}>{tag}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </TouchableOpacity>
    );

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
                    Task Board
                </Text>
                <TouchableOpacity>
                    <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
            </LinearGradient>

            {/* Stats Bar */}
            <View style={styles.statsBar}>
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                        {tasks.todo.length}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textLight }]}>To Do</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: '#FFA500' }]}>
                        {tasks.doing.length}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textLight }]}>In Progress</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: '#4CAF50' }]}>
                        {tasks.done.length}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textLight }]}>Done</Text>
                </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                {/* Todo Column */}
                <View style={styles.column}>
                    <View style={[styles.columnHeader, { backgroundColor: 'rgba(245, 166, 35, 0.1)' }]}>
                        <Ionicons name="list" size={20} color={theme.colors.primary} />
                        <Text style={[styles.columnTitle, { color: theme.colors.text }]}>
                            To Do ({tasks.todo.length})
                        </Text>
                    </View>
                    <ScrollView style={styles.columnContent}>
                        {tasks.todo.map(renderTask)}
                    </ScrollView>
                </View>

                {/* Doing Column */}
                <View style={styles.column}>
                    <View style={[styles.columnHeader, { backgroundColor: 'rgba(255, 165, 0, 0.1)' }]}>
                        <Ionicons name="hourglass" size={20} color="#FFA500" />
                        <Text style={[styles.columnTitle, { color: theme.colors.text }]}>
                            Doing ({tasks.doing.length})
                        </Text>
                    </View>
                    <ScrollView style={styles.columnContent}>
                        {tasks.doing.map(renderTask)}
                    </ScrollView>
                </View>

                {/* Done Column */}
                <View style={styles.column}>
                    <View style={[styles.columnHeader, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                        <Text style={[styles.columnTitle, { color: theme.colors.text }]}>
                            Done ({tasks.done.length})
                        </Text>
                    </View>
                    <ScrollView style={styles.columnContent}>
                        {tasks.done.map(renderTask)}
                    </ScrollView>
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
    statsBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(245, 166, 35, 0.1)',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    column: {
        width: width * 0.85,
        marginHorizontal: 8,
        marginTop: 16,
    },
    columnHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 8,
        marginBottom: 12,
    },
    columnTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    columnContent: {
        flex: 1,
    },
    taskCard: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(245, 166, 35, 0.1)',
    },
    taskHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        marginBottom: 8,
    },
    priorityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: 6,
    },
    taskTitle: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
    },
    taskMeta: {
        gap: 8,
    },
    assigneeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    assignee: {
        fontSize: 12,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 10,
        fontWeight: '600',
    },
});
