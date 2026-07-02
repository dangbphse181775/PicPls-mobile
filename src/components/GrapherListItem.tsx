import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../theme/colors';
import type { GrapherSummaryResponse } from '../types/booking.types';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const renderStars = (rating: number) => {
  const full = Math.floor(rating || 0);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
};

interface Props {
  grapher: GrapherSummaryResponse;
  onPress: () => void;
  variant?: 'row' | 'grid';
}

export default function GrapherListItem({ grapher, onPress, variant = 'row' }: Props) {
  if (variant === 'grid') {
    return (
      <TouchableOpacity style={styles.gridCard} onPress={onPress} activeOpacity={0.85}>
        <View style={styles.gridAvatarWrapper}>
          {grapher.avatar ? (
            <Image source={{ uri: grapher.avatar }} style={styles.gridAvatarImg} />
          ) : (
            <Text style={styles.gridAvatarText}>{(grapher.name || '?').charAt(0).toUpperCase()}</Text>
          )}
          {grapher.isOnline && <View style={styles.gridOnlineDot} />}
          {grapher.isVerified && (
            <View style={styles.gridVerifiedBadge}>
              <Text style={styles.gridVerifiedText}>✓</Text>
            </View>
          )}
        </View>
        <Text style={styles.gridName} numberOfLines={1}>
          {grapher.name}
        </Text>
        <Text style={styles.gridLocation} numberOfLines={1}>
          📍 {grapher.location}
        </Text>
        <View style={styles.gridRatingRow}>
          <Text style={styles.gridStars}>{renderStars(grapher.rating || 0)}</Text>
          <Text style={styles.gridRatingText}>{(grapher.rating || 0).toFixed(1)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.avatarWrapper}>
        {grapher.avatar ? (
          <Image source={{ uri: grapher.avatar }} style={styles.avatarImg} />
        ) : (
          <Text style={styles.avatarText}>{(grapher.name || '?').charAt(0).toUpperCase()}</Text>
        )}
        {grapher.isOnline && <View style={styles.onlineDot} />}
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardRow}>
          <Text style={styles.cardName} numberOfLines={1}>
            {grapher.name}
          </Text>
          {grapher.isVerified && <Text style={styles.verifiedBadge}>✓ Verified</Text>}
        </View>
        <Text style={styles.cardLocation} numberOfLines={1}>
          📍 {grapher.location}
        </Text>
        <View style={styles.tagsRow}>
          {(grapher.styles || []).slice(0, 3).map(s => (
            <View key={s} style={styles.tag}>
              <Text style={styles.tagText}>{s}</Text>
            </View>
          ))}
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.ratingRow}>
            <Text style={styles.stars}>{renderStars(grapher.rating || 0)}</Text>
            <Text style={styles.ratingText}>
              {(grapher.rating || 0).toFixed(1)} ({grapher.reviewCount || 0})
            </Text>
          </View>
          <Text style={styles.priceText}>
            từ {formatCurrency(grapher.pricing?.hourly || 0)}/giờ
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Row variant
  card: {
    backgroundColor: 'rgba(26,26,46,0.88)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    flexDirection: 'row',
    padding: 14,
    marginBottom: 12,
    gap: 14,
  },
  avatarWrapper: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarText: { fontSize: 24, fontWeight: '700', color: COLORS.primaryLight },
  onlineDot: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  cardContent: { flex: 1, gap: 4 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, flex: 1 },
  verifiedBadge: {
    fontSize: 10,
    color: COLORS.success,
    fontWeight: '600',
    backgroundColor: COLORS.successSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cardLocation: { fontSize: 12, color: COLORS.textMuted },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 2 },
  tag: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tagText: { fontSize: 10, color: COLORS.primaryLight, fontWeight: '600' },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stars: { fontSize: 11, color: COLORS.accent },
  ratingText: { fontSize: 11, color: COLORS.textMuted },
  priceText: { fontSize: 12, color: COLORS.accent, fontWeight: '700' },

  // Grid variant
  gridCard: {
    flex: 1,
    backgroundColor: 'rgba(26,26,46,0.88)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 14,
    margin: 6,
    alignItems: 'center',
  },
  gridAvatarWrapper: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    position: 'relative',
    overflow: 'hidden',
  },
  gridAvatarImg: { width: '100%', height: '100%' },
  gridAvatarText: { fontSize: 28, fontWeight: '700', color: COLORS.primaryLight },
  gridOnlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  gridVerifiedBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  gridVerifiedText: { color: COLORS.white, fontSize: 11, fontWeight: '800' },
  gridName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },
  gridLocation: { fontSize: 11, color: COLORS.textMuted, marginTop: 2, textAlign: 'center' },
  gridRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  gridStars: { fontSize: 11, color: COLORS.accent },
  gridRatingText: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
});
