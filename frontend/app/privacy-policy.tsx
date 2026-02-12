import { useTheme } from '@/lib/theme-context';
import { premiumColors, radius, spacing } from '@/lib/premium-theme';
import { useRouter } from 'expo-router';
import { ArrowLeft, Shield, Eye, Lock, Server, Trash2, Mail } from 'lucide-react-native';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LAST_UPDATED = '12 February 2026';

interface SectionProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  children: React.ReactNode;
  colors: ReturnType<typeof premiumColors>;
}

function PolicySection({ icon, iconBg, title, children, colors }: SectionProps) {
  return (
    <View
      style={{
        backgroundColor: colors.cardBg,
        borderColor: colors.cardBorder,
        borderWidth: 1,
        borderRadius: radius.xl,
        padding: spacing.xl,
        marginBottom: spacing.lg,
        ...colors.shadow.sm,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: iconBg,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          {icon}
        </View>
        <Text
          style={{
            color: colors.text,
            fontSize: 16,
            fontWeight: '700',
            flex: 1,
          }}
        >
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

function BulletPoint({ text, colors }: { text: string; colors: ReturnType<typeof premiumColors> }) {
  return (
    <View style={{ flexDirection: 'row', marginBottom: 8, paddingRight: spacing.md }}>
      <View
        style={{
          width: 5,
          height: 5,
          borderRadius: 3,
          backgroundColor: colors.accent,
          marginTop: 7,
          marginRight: 10,
          flexShrink: 0,
        }}
      />
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 13,
          lineHeight: 20,
          fontWeight: '500',
          flex: 1,
        }}
      >
        {text}
      </Text>
    </View>
  );
}

function Paragraph({ text, colors }: { text: string; colors: ReturnType<typeof premiumColors> }) {
  return (
    <Text
      style={{
        color: colors.textSecondary,
        fontSize: 13,
        lineHeight: 20,
        fontWeight: '500',
        marginBottom: 8,
      }}
    >
      {text}
    </Text>
  );
}

export default function PrivacyPolicyScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const colors = premiumColors(isDark);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: spacing['4xl'] }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            paddingHorizontal: spacing['2xl'],
            paddingTop: spacing.xl,
            paddingBottom: spacing.xl,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              alignSelf: 'flex-start',
              paddingHorizontal: 14,
              paddingVertical: 10,
              gap: 6,
              backgroundColor: colors.glassBg,
              borderColor: colors.glassBorder,
              borderWidth: 1,
              borderRadius: radius.md,
              marginBottom: spacing['2xl'],
              ...colors.shadow.sm,
            }}
          >
            <ArrowLeft size={16} color={colors.text} />
            <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>Back</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: colors.accentSoft,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: `${colors.accent}20`,
              }}
            >
              <Shield size={22} color={colors.accent} />
            </View>
            <View>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 26,
                  fontWeight: '800',
                  letterSpacing: -0.7,
                }}
              >
                Privacy Policy
              </Text>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 12,
                  fontWeight: '500',
                  marginTop: 2,
                }}
              >
                Last updated: {LAST_UPDATED}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: spacing['2xl'] }}>
          {/* Introduction */}
          <View
            style={{
              backgroundColor: colors.accentSoft,
              borderRadius: radius.xl,
              padding: spacing.xl,
              marginBottom: spacing.lg,
              borderWidth: 1,
              borderColor: `${colors.accent}20`,
            }}
          >
            <Text
              style={{
                color: colors.text,
                fontSize: 14,
                lineHeight: 22,
                fontWeight: '500',
              }}
            >
              At Captr, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information when you use our business card scanning application.
            </Text>
          </View>

          {/* Data We Collect */}
          <PolicySection
            icon={<Eye size={18} color={colors.info} />}
            iconBg={colors.infoSoft}
            title="Information We Collect"
            colors={colors}
          >
            <Paragraph
              text="We collect the following information to provide and improve our services:"
              colors={colors}
            />
            <BulletPoint
              text="Account Information: Name, email address, and password when you create an account, or Google profile data if you sign in with Google."
              colors={colors}
            />
            <BulletPoint
              text="Business Card Data: Images you scan and the extracted text information (names, phone numbers, emails, company details, addresses)."
              colors={colors}
            />
            <BulletPoint
              text="Contact Data: Information stored in your saved contacts within the app."
              colors={colors}
            />
            <BulletPoint
              text="Payment Information: When Pro subscriptions become available, transaction IDs and plan details will be stored. We will not store your card/bank details — all payments will be processed securely by our payment provider."
              colors={colors}
            />
            <BulletPoint
              text="Usage Data: App usage patterns, scan counts, and feature usage to improve our service."
              colors={colors}
            />
          </PolicySection>

          {/* How We Use Data */}
          <PolicySection
            icon={<Server size={18} color={colors.accent} />}
            iconBg={colors.accentSoft}
            title="How We Use Your Data"
            colors={colors}
          >
            <BulletPoint
              text="To provide core functionality: scanning business cards, extracting contact details, and storing your contacts."
              colors={colors}
            />
            <BulletPoint
              text="To process OCR (Optical Character Recognition) using AI services to accurately extract text from card images."
              colors={colors}
            />
            <BulletPoint
              text="To power the AI chatbot assistant for Pro users."
              colors={colors}
            />
            <BulletPoint
              text="To manage your subscription and process payments (when available)."
              colors={colors}
            />
            <BulletPoint
              text="To send important updates about your account or service changes."
              colors={colors}
            />
            <BulletPoint
              text="To improve and optimise the app experience based on aggregated, anonymised usage data."
              colors={colors}
            />
          </PolicySection>

          {/* Data Security */}
          <PolicySection
            icon={<Lock size={18} color={colors.success} />}
            iconBg={colors.successSoft}
            title="Data Security"
            colors={colors}
          >
            <Paragraph
              text="We implement industry-standard security measures to protect your data:"
              colors={colors}
            />
            <BulletPoint
              text="All data is transmitted over HTTPS with TLS encryption."
              colors={colors}
            />
            <BulletPoint
              text="Authentication is handled securely through Firebase Authentication."
              colors={colors}
            />
            <BulletPoint
              text="Your data is stored in Google Cloud (Firebase) with enterprise-grade security."
              colors={colors}
            />
            <BulletPoint
              text="API keys and sensitive credentials are stored securely and never exposed to the client."
              colors={colors}
            />
            <BulletPoint
              text="When payments are enabled, processing will be handled by a PCI DSS compliant payment provider. We will never store your financial details."
              colors={colors}
            />
          </PolicySection>

          {/* Third-Party Services */}
          <PolicySection
            icon={<Server size={18} color={colors.warning} />}
            iconBg={colors.warningSoft}
            title="Third-Party Services"
            colors={colors}
          >
            <Paragraph
              text="We use the following trusted third-party services:"
              colors={colors}
            />
            <BulletPoint text="Firebase (Google) — Authentication, database, and cloud storage." colors={colors} />
            <BulletPoint text="OpenAI — For OCR text extraction and AI chatbot functionality." colors={colors} />
            <BulletPoint text="Google Play Billing — For secure payment processing (when available)." colors={colors} />
            <BulletPoint text="Expo / EAS — For app building and over-the-air updates." colors={colors} />
            <Paragraph
              text="Each of these services has their own privacy policies. We recommend reviewing them for complete information about how they handle data."
              colors={colors}
            />
          </PolicySection>

          {/* Data Retention & Deletion */}
          <PolicySection
            icon={<Trash2 size={18} color={colors.danger} />}
            iconBg={colors.dangerSoft}
            title="Data Retention & Deletion"
            colors={colors}
          >
            <BulletPoint
              text="Your account data and contacts are retained as long as your account is active."
              colors={colors}
            />
            <BulletPoint
              text="You can delete individual contacts at any time from within the app."
              colors={colors}
            />
            <BulletPoint
              text="To delete your entire account and all associated data, contact us at support@captr.app."
              colors={colors}
            />
            <BulletPoint
              text="Upon account deletion, all your personal data, scanned cards, and contacts will be permanently removed within 30 days."
              colors={colors}
            />
            <BulletPoint
              text="Payment records may be retained for up to 7 years as required by Indian tax and financial regulations."
              colors={colors}
            />
          </PolicySection>

          {/* Your Rights (India / DPDP Act) */}
          <PolicySection
            icon={<Shield size={18} color={colors.accent} />}
            iconBg={colors.accentSoft}
            title="Your Rights"
            colors={colors}
          >
            <Paragraph
              text="Under the Digital Personal Data Protection Act, 2023 (India), you have the right to:"
              colors={colors}
            />
            <BulletPoint text="Access the personal data we hold about you." colors={colors} />
            <BulletPoint text="Request correction of inaccurate personal data." colors={colors} />
            <BulletPoint text="Request deletion of your personal data." colors={colors} />
            <BulletPoint text="Withdraw consent for data processing at any time." colors={colors} />
            <BulletPoint text="File a complaint with the Data Protection Board of India if you believe your rights have been violated." colors={colors} />
          </PolicySection>

          {/* Children's Privacy */}
          <PolicySection
            icon={<Shield size={18} color={colors.info} />}
            iconBg={colors.infoSoft}
            title="Children's Privacy"
            colors={colors}
          >
            <Paragraph
              text="Captr is not intended for use by individuals under the age of 18. We do not knowingly collect personal data from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately."
              colors={colors}
            />
          </PolicySection>

          {/* Contact */}
          <PolicySection
            icon={<Mail size={18} color={colors.success} />}
            iconBg={colors.successSoft}
            title="Contact Us"
            colors={colors}
          >
            <Paragraph
              text="If you have any questions about this Privacy Policy or want to exercise your data rights, contact us at:"
              colors={colors}
            />
            <View
              style={{
                backgroundColor: colors.bgSubtle,
                borderRadius: radius.lg,
                padding: spacing.lg,
                marginTop: 4,
              }}
            >
              <Text style={{ color: colors.accent, fontSize: 14, fontWeight: '700' }}>
                support@captr.app
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4, fontWeight: '500' }}>
                Captr App | India
              </Text>
            </View>
          </PolicySection>

          {/* Footer */}
          <View style={{ alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.xl }}>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 11,
                fontWeight: '500',
                textAlign: 'center',
                lineHeight: 18,
              }}
            >
              By using Captr, you agree to this Privacy Policy.{'\n'}
              We may update this policy from time to time.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
