import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

const roles: { id: UserRole; label: string; description: string; color: string }[] = [
  { id: 'user', label: 'Customer', description: 'Shop and buy products', color: Colors.user },
  { id: 'seller', label: 'Seller', description: 'Sell products with custom pricing', color: Colors.seller },
  { id: 'distributor', label: 'Distributor', description: 'Wholesale buying', color: Colors.distributor },
  { id: 'admin', label: 'Administrator', description: 'Manage the entire platform', color: Colors.admin },
];

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    const result = await register(name.trim(), email.trim(), password, selectedRole);
    setIsLoading(false);
    
    if (result.success) {
      router.replace('/(tabs)/(home)');
    } else {
      Alert.alert('Registration Failed', result.error || 'Please try again');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.header}
      >
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Create Account</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formContainer}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Join FlipMart</Text>
          <Text style={styles.subtitle}>Create your account to start shopping</Text>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <User size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full name"
                placeholderTextColor={Colors.textMuted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Mail size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Lock size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="new-password"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                {showPassword ? (
                  <EyeOff size={20} color={Colors.textMuted} />
                ) : (
                  <Eye size={20} color={Colors.textMuted} />
                )}
              </Pressable>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Lock size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm password"
                placeholderTextColor={Colors.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoComplete="new-password"
              />
            </View>
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          </View>

          <Text style={styles.roleTitle}>Select Account Type</Text>
          <View style={styles.rolesContainer}>
            {roles.map((role) => (
              <Pressable
                key={role.id}
                style={[
                  styles.roleCard,
                  selectedRole === role.id && { borderColor: role.color, borderWidth: 2 },
                ]}
                onPress={() => setSelectedRole(role.id)}
              >
                <View style={styles.roleHeader}>
                  <Text style={[styles.roleLabel, selectedRole === role.id && { color: role.color }]}>
                    {role.label}
                  </Text>
                  {selectedRole === role.id && (
                    <View style={[styles.checkIcon, { backgroundColor: role.color }]}>
                      <Check size={12} color="#fff" />
                    </View>
                  )}
                </View>
                <Text style={styles.roleDescription}>{role.description}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>Create Account</Text>
            )}
          </Pressable>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.loginLink}>Sign In</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  formContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
    color: Colors.text,
  },
  eyeButton: {
    padding: 14,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 12,
  },
  rolesContainer: {
    gap: 12,
    marginBottom: 24,
  },
  roleCard: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  registerButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
});
