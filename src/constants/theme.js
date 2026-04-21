// src/constants/theme.js
export const colors = {
  primary:    '#F59E0B',
  primary600: '#D97706',
  primary700: '#B45309',
  primary50:  '#FFFBEB',

  accent:     '#4F46E5',
  accent50:   '#EEF2FF',

  success:    '#10B981',
  danger:     '#EF4444',

  ink:        '#0F172A',
  ink2:       '#334155',
  ink3:       '#64748B',
  ink4:       '#94A3B8',
  line:       '#E2E8F0',

  surface:    '#FFFFFF',
  surface2:   '#F8FAFC',
  surface3:   '#F1F5F9',

  thumbPink:  ['#EC4899', '#DB2777'],
  thumbGreen: ['#10B981', '#059669'],
  thumbBlue:  ['#3B82F6', '#2563EB'],
  thumbAmber: ['#F59E0B', '#D97706'],
};

export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 40,
};

export const radius = {
  sm: 8, md: 12, lg: 16, xl: 20, pill: 999,
};

export const typography = {
  heading: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  title:   { fontSize: 17, fontWeight: '600' },
  body:    { fontSize: 14, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '500' },
  micro:   { fontSize: 10, fontWeight: '500' },
  serif:   { fontFamily: 'Georgia' },
};

export const shadow = {
  sm: {
    shadowColor: '#0F172A', shadowOpacity: 0.06, shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  md: {
    shadowColor: '#0F172A', shadowOpacity: 0.08, shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 }, elevation: 4,
  },
  primary: {
    shadowColor: '#F59E0B', shadowOpacity: 0.35, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
};

export default { colors, spacing, radius, typography, shadow };