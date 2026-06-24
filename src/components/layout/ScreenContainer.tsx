
import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '../../constants/theme';

type ScreenContainerProps = {
    children: ReactNode;
};

// Gemeinsamer Container für alle Screens mit App-Hintergrund und Padding.
export function ScreenContainer({ children }: ScreenContainerProps) {
    return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: spacing.md,
    },
});