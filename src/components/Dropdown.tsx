import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../theme/colors';

export interface DropdownOption<T = string> {
  value: T;
  label: string;
}

interface DropdownProps<T = string> {
  label?: string;
  placeholder?: string;
  value: T | '' | null;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  icon?: string;
  /** Optional: cho phép rỗng (clear). Mặc định true. */
  allowClear?: boolean;
  clearLabel?: string;
}

export default function Dropdown<T = string>({
  label,
  placeholder = 'Tất cả',
  value,
  options,
  onChange,
  icon,
  allowClear = true,
  clearLabel = 'Tất cả',
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const [layout, setLayout] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const triggerRef = useRef<View>(null);

  const selectedOption = options.find(o => o.value === value);
  const displayText = selectedOption?.label || placeholder;
  const hasValue = !!selectedOption;

  useEffect(() => {
    if (!open) return;
    if (triggerRef.current && (triggerRef.current as any).measureInWindow) {
      (triggerRef.current as any).measureInWindow((x: number, y: number, w: number, h: number) => {
        setLayout({ x, y, w, h });
      });
    }
  }, [open]);

  const handleSelect = (val: T) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TouchableOpacity
        ref={triggerRef as any}
        style={[styles.trigger, hasValue && styles.triggerActive]}
        activeOpacity={0.7}
        onPress={() => setOpen(true)}
      >
        {icon ? <Text style={styles.triggerIcon}>{icon}</Text> : null}
        <Text
          style={[styles.triggerText, hasValue && styles.triggerTextActive]}
          numberOfLines={1}
        >
          {displayText}
        </Text>
        <Text style={[styles.chevron, hasValue && styles.chevronActive]}>▾</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable
            style={[
              styles.sheet,
              { left: Math.max(12, layout.x), width: layout.w, top: layout.y + layout.h + 6 },
            ]}
            onPress={() => {}}
          >
            {allowClear ? (
              <TouchableOpacity
                style={[styles.option, !hasValue && styles.optionActive]}
                onPress={() => handleSelect('' as T)}
              >
                <Text style={styles.optionIcon}>⊘</Text>
                <Text style={[styles.optionText, !hasValue && styles.optionTextActive]}>
                  {clearLabel}
                </Text>
                {!hasValue ? <Text style={styles.checkmark}>✓</Text> : null}
              </TouchableOpacity>
            ) : null}
            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const active = item.value === value;
                return (
                  <TouchableOpacity
                    style={[styles.option, active && styles.optionActive]}
                    onPress={() => handleSelect(item.value)}
                  >
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>
                      {item.label}
                    </Text>
                    {active ? <Text style={styles.checkmark}>✓</Text> : null}
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              style={styles.list}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    minHeight: 46,
  },
  triggerActive: { backgroundColor: COLORS.primarySoft, borderColor: COLORS.primary },
  triggerIcon: { fontSize: 14 },
  triggerText: { flex: 1, fontSize: 14, color: COLORS.textMuted, fontWeight: '600' },
  triggerTextActive: { color: COLORS.primaryLight },
  chevron: { fontSize: 14, color: COLORS.textMuted, fontWeight: '700' },
  chevronActive: { color: COLORS.primaryLight },

  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.55)' },
  sheet: {
    position: 'absolute',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    maxHeight: 320,
    overflow: 'hidden',
    paddingVertical: 4,
  },
  list: { flexGrow: 0, maxHeight: 280 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  optionActive: { backgroundColor: COLORS.primarySoft },
  optionIcon: { fontSize: 12, color: COLORS.textMuted, width: 14 },
  optionText: { flex: 1, fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },
  optionTextActive: { color: COLORS.primaryLight, fontWeight: '700' },
  checkmark: { fontSize: 13, color: COLORS.primaryLight, fontWeight: '800' },
  separator: { height: 1, backgroundColor: COLORS.border, marginLeft: 14 },
});
