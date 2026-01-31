import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  FlatList,
} from 'react-native';
import { theme } from '../theme';

const HistoricalIntelligenceScreen = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  const handleAnalyze = useCallback(async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a hackathon URL');
      return;
    }

    setLoading(true);
    try {
      // Call Python backend via subprocess or API
      // For now, this is a placeholder that shows how it would integrate
      Alert.alert(
        'Analysis Started',
        'The system will analyze past hackathon winners.\n\nNote: This requires running the Python backend separately.'
      );
      setLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze hackathon');
      setLoading(false);
    }
  }, [url]);

  if (report) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setReport(null)}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.reportSection}>
          <Text style={styles.reportTitle}>Intelligence Report</Text>

          {/* Summary */}
          <View style={styles.summaryBox}>
            <Text style={styles.sectionTitle}>📊 Summary</Text>
            <Text style={styles.summaryText}>
              Past Editions: {report.summary?.total_past_editions || 0}
            </Text>
            <Text style={styles.summaryText}>
              Winners Analyzed: {report.summary?.total_winners_analyzed || 0}
            </Text>
          </View>

          {/* Top Technologies */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔧 Top Technologies</Text>
            {report.tech_stack_analysis?.top_technologies?.slice(0, 5).map(
              (tech: any, idx: number) => (
                <View key={idx} style={styles.techItem}>
                  <Text style={styles.techName}>{tech.technology}</Text>
                  <Text style={styles.techPercentage}>{tech.percentage}%</Text>
                </View>
              )
            )}
          </View>

          {/* Winning Themes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Winning Themes</Text>
            {report.winning_themes?.top_themes?.map(
              (theme: any, idx: number) => (
                <View key={idx} style={styles.themeItem}>
                  <Text style={styles.themeName}>{theme.theme}</Text>
                  <Text style={styles.themePercentage}>
                    {theme.percentage}%
                  </Text>
                </View>
              )
            )}
          </View>

          {/* Insights */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💡 Key Insights</Text>
            {report.actionable_insights?.slice(0, 5).map(
              (insight: string, idx: number) => (
                <Text key={idx} style={styles.insightText}>
                  • {insight}
                </Text>
              )
            )}
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Historical Intelligence</Text>
        <Text style={styles.headerSubtitle}>
          Analyze past hackathon winners to discover winning patterns
        </Text>
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.label}>Hackathon URL</Text>
        <TextInput
          style={styles.input}
          placeholder="https://bevhacks-2026.devpost.com"
          placeholderTextColor={theme.colors.textSecondary}
          value={url}
          onChangeText={setUrl}
          editable={!loading}
        />
        <Text style={styles.helperText}>
          Enter the URL of the hackathon you want to analyze
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.analyzeButton, loading && styles.analyzeButtonDisabled]}
        onPress={handleAnalyze}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.analyzeButtonText}>Analyze Hackathon</Text>
        )}
      </TouchableOpacity>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>What does this do?</Text>
        <Text style={styles.infoText}>
          ✓ Finds all past editions of the hackathon by visiting the organizer's profile
        </Text>
        <Text style={styles.infoText}>
          ✓ Scrapes winning projects and their technologies
        </Text>
        <Text style={styles.infoText}>
          ✓ Analyzes patterns in tech stack, themes, and team composition
        </Text>
        <Text style={styles.infoText}>
          ✓ Generates strategic insights to help you win
        </Text>
      </View>

      <View style={styles.setupSection}>
        <Text style={styles.setupTitle}>⚙️ Setup Required</Text>
        <Text style={styles.setupText}>
          To use this feature, you need to run the Python backend:
        </Text>
        <View style={styles.codeBlock}>
          <Text style={styles.codeText}>
            cd scrapers{'\n'}
            pip install playwright{'\n'}
            python historical_pipeline.py
          </Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            Linking.openURL(
              'https://github.com/yourusername/devcompass#historical-intelligence'
            )
          }
        >
          <Text style={styles.docLink}>View Documentation →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  headerSection: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 6,
    backgroundColor: theme.colors.cardBackground,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  analyzeButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
  },
  analyzeButtonDisabled: {
    opacity: 0.6,
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  setupSection: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  setupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  setupText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  codeBlock: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  codeText: {
    color: '#00ff00',
    fontFamily: 'Courier New',
    fontSize: 12,
    lineHeight: 18,
  },
  docLink: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  // Report styles
  reportSection: {
    marginBottom: 32,
  },
  reportTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 20,
  },
  summaryBox: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  summaryText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  techItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 8,
    marginBottom: 8,
  },
  techName: {
    fontSize: 13,
    color: theme.colors.text,
    flex: 1,
    fontWeight: '500',
  },
  techPercentage: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  themeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 8,
    marginBottom: 8,
  },
  themeName: {
    fontSize: 13,
    color: theme.colors.text,
    flex: 1,
    fontWeight: '500',
  },
  themePercentage: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  insightText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
});

export default HistoricalIntelligenceScreen;
